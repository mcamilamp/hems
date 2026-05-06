import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeApi, Point } from "@/lib/influxdb";

const ALLOWED_UNITS = new Set(["A", "V", "W", "kWh"]);
const MAX_READINGS_PER_REQUEST = 32;

const SANE_MAX = {
  A: 200,      // up to a 200 A panel feed; per-appliance is well under
  V: 600,      // covers 120/230/400 V mains with headroom
  W: 50000,    // 50 kW absurd cap for residential
  kWh: 100,    // per single POST increment; sanity bound
};

function normalizeReading(entry) {
  if (!entry || typeof entry !== "object") {
    return { error: "reading must be an object" };
  }
  const unit = entry.unit ?? "kWh";
  if (!ALLOWED_UNITS.has(unit)) {
    return { error: `unit must be one of ${[...ALLOWED_UNITS].join(", ")}` };
  }
  const value = Number(entry.value);
  if (!Number.isFinite(value)) {
    return { error: "value must be a finite number" };
  }
  if (value < 0) {
    return { error: "value must be non-negative" };
  }
  if (value > SANE_MAX[unit]) {
    return { error: `value for ${unit} exceeds sane maximum ${SANE_MAX[unit]}` };
  }
  return { value, unit };
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const device = await prisma.device.findUnique({
      where: { apiToken: token }
    });

    if (!device) {
      return NextResponse.json({ message: "Invalid Token" }, { status: 403 });
    }

    const body = await request.json();

    let readings;
    if (Array.isArray(body?.readings)) {
      if (body.readings.length === 0) {
        return NextResponse.json({ message: "readings is empty" }, { status: 400 });
      }
      if (body.readings.length > MAX_READINGS_PER_REQUEST) {
        return NextResponse.json(
          { message: `readings must contain at most ${MAX_READINGS_PER_REQUEST} entries` },
          { status: 400 }
        );
      }
      readings = body.readings;
    } else if (body?.value !== undefined) {
      readings = [{ value: body.value, unit: body.unit ?? "kWh" }];
    } else {
      return NextResponse.json({ message: "Missing value or readings" }, { status: 400 });
    }

    const points = [];
    for (const entry of readings) {
      const r = normalizeReading(entry);
      if (r.error) {
        return NextResponse.json({ message: r.error }, { status: 400 });
      }
      points.push(
        new Point("consumption")
          .tag("deviceId", device.id)
          .tag("unit", r.unit)
          .floatField("value", r.value)
      );
    }

    for (const p of points) writeApi.writePoint(p);

    await prisma.device.update({
      where: { id: device.id },
      data: { status: "online", updatedAt: new Date() }
    });

    const response = NextResponse.json({ success: true, written: points.length });

    writeApi.flush().catch(err => {
      console.error("InfluxDB flush error (non-critical):", err);
    });

    return response;

  } catch (error) {
    if (error.code !== 'ECONNRESET' && error.code !== 'ECONNABORTED') {
      console.error("IoT Ingestion Error:", error);
    }
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
