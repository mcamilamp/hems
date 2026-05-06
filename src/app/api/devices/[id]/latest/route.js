import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { queryApi } from "@/lib/influxdb";

const UNITS = ["A", "V", "W", "kWh"];
const UNIT_TO_KEY = {
  A: "currentRms",
  V: "voltageRms",
  W: "powerW",
  kWh: "energyKwh",
};

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const device = await prisma.device.findUnique({ where: { id } });
  if (!device) return NextResponse.json({ message: "Dispositivo no encontrado" }, { status: 404 });
  if (session.user.role !== "admin" && device.userId !== session.user.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const bucket = process.env.INFLUXDB_BUCKET || "hems_metrics";
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -5m)
      |> filter(fn: (r) => r._measurement == "consumption")
      |> filter(fn: (r) => r.deviceId == "${id}")
      |> filter(fn: (r) => r._field == "value")
      |> group(columns: ["unit"])
      |> last()
  `;

  const result = { voltageRms: null, currentRms: null, powerW: null, energyKwh: null, lastUpdate: null };

  try {
    await new Promise((resolve) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          const key = UNIT_TO_KEY[o.unit];
          if (key && UNITS.includes(o.unit)) {
            result[key] = Number(o._value);
            if (!result.lastUpdate || new Date(o._time) > new Date(result.lastUpdate)) {
              result.lastUpdate = o._time;
            }
          }
        },
        error(err) { console.error("Influx latest query error:", err); resolve(); },
        complete() { resolve(); },
      });
    });
  } catch (e) {
    console.error("InfluxDB Error", e);
  }

  return NextResponse.json(result);
}
