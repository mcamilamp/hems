import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeApi, Point } from "@/lib/influxdb";

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
    const { value, unit = "kWh" } = body;

    if (value === undefined) {
      return NextResponse.json({ message: "Missing value" }, { status: 400 });
    }

    const point = new Point('consumption')
      .tag('deviceId', device.id)
      .tag('unit', unit)
      .floatField('value', parseFloat(value));
    
    writeApi.writePoint(point);
    
    await prisma.device.update({
      where: { id: device.id },
      data: { status: "online", updatedAt: new Date() }
    });

    const response = NextResponse.json({ success: true });
    
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
