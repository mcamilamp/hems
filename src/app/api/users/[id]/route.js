import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { queryApi } from "@/lib/influxdb";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  // Get user's devices
  const devices = await prisma.device.findMany({
    where: { userId: id }
  });

  const bucket = process.env.INFLUXDB_BUCKET || 'hems_metrics';
  
  // 1. Get latest consumption per device
  const lastConsumptions = {};
  const lastQuery = `
    from(bucket: "${bucket}")
      |> range(start: -2h)
      |> filter(fn: (r) => r._measurement == "consumption")
      |> last()
  `;
  
  try {
    await new Promise((resolve) => {
       queryApi.queryRows(lastQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          if (o.deviceId) lastConsumptions[o.deviceId] = o._value;
        },
        error(e) { console.error(e); resolve(); },
        complete() { resolve(); }
       });
    });
  } catch(e) {}

  const devicesWithConsumption = devices.map(d => ({
    ...d,
    consumption: (lastConsumptions[d.id] || 0).toFixed(2) + " kWh"
  }));

  // 2. Calculate Total Consumption for User (All time or last 30d)
  // Filter by list of device IDs owned by user
  const deviceIds = devices.map(d => `r.deviceId == "${d.id}"`).join(" or ");
  let totalConsumption = 0;

  if (deviceIds.length > 0) {
    const sumQuery = `
      from(bucket: "${bucket}")
        |> range(start: -30d)
        |> filter(fn: (r) => r._measurement == "consumption")
        |> filter(fn: (r) => r._field == "value")
        |> filter(fn: (r) => ${deviceIds})
        |> sum()
    `;
    try {
      await new Promise((resolve) => {
         queryApi.queryRows(sumQuery, {
          next(row, tableMeta) {
            const o = tableMeta.toObject(row);
            totalConsumption = o._value;
          },
          error(e) { console.error(e); resolve(); },
          complete() { resolve(); }
         });
      });
    } catch(e) {}
  }

  return NextResponse.json({
    user: {
      ...user,
      status: "Activo", 
      joinedDate: new Date(user.createdAt).toLocaleDateString(),
      lastActive: new Date(user.updatedAt).toLocaleString(),
    },
    devices: devicesWithConsumption,
    metrics: {
      totalDevices: devices.length,
      activeDevices: devices.filter(d => d.status === 'online').length,
      totalConsumption: totalConsumption.toFixed(2) + " kWh",
      monthlyCost: "$" + (totalConsumption * 0.15).toFixed(2),
      savingsPercentage: 15 
    }
  });
}
