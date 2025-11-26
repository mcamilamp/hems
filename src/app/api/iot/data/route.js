import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeApi, Point } from "@/lib/influxdb";

export async function POST(request) {
  try {
    // Check Authorization header for API Token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    
    // Find device by token
    const device = await prisma.device.findUnique({
      where: { apiToken: token }
    });

    if (!device) {
      return NextResponse.json({ message: "Invalid Token" }, { status: 403 });
    }

    const body = await request.json();
    const { value, unit = "kWh" } = body;

    if (value === undefined) {
      return NextResponse.json({ message: "Missing value" }, { status: 400 });
    }

    // Record consumption to InfluxDB
    const point = new Point('consumption')
      .tag('deviceId', device.id)
      .tag('unit', unit)
      .floatField('value', parseFloat(value));
    
    writeApi.writePoint(point);
    // Ideally flush periodically, but for low volume/demo immediate flush is safer to see data
    await writeApi.flush(); 

    // Note: We are skipping writing to Postgres Consumption table now, relying on InfluxDB for time-series.
    // However, we still update device status in Postgres.

    // Update device status to online
    await prisma.device.update({
      where: { id: device.id },
      data: { status: "online", updatedAt: new Date() }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("IoT Ingestion Error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
