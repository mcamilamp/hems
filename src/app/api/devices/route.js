import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { v4 as uuidv4 } from 'uuid';
import { queryApi } from "@/lib/influxdb";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  let where = {};
  if (session.user.role !== "admin") {
    where.userId = session.user.id;
  }

  const devices = await prisma.device.findMany({
    where,
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });

  // Fetch latest consumption from InfluxDB for each device
  // Efficiently, we should use one query with group by deviceId, but for simplicity we iterate
  // Or we can query last values for all devices.
  
  const bucket = process.env.INFLUXDB_BUCKET || 'hems_metrics';
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "consumption")
      |> last()
  `;

  const lastConsumptions = {};
  
  try {
    await new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          if (o.deviceId) {
            lastConsumptions[o.deviceId] = `${o._value} ${o.unit || 'kWh'}`;
          }
        },
        error(error) { console.error(error); resolve(); }, // Resolve anyway to show partial data
        complete() { resolve(); },
      });
    });
  } catch (e) {
    console.error("InfluxDB Error", e);
  }

  const devicesWithConsumption = devices.map(d => ({
    ...d,
    consumption: lastConsumptions[d.id] || "0 kWh"
  }));

  return NextResponse.json(devicesWithConsumption);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { name, type, location, userId } = body;

  const targetUserId = (session.user.role === "admin" && userId) ? userId : session.user.id;

  const device = await prisma.device.create({
    data: {
      name,
      type,
      location,
      userId: targetUserId,
      apiToken: uuidv4(), 
      status: "offline"
    }
  });

  return NextResponse.json(device);
}
