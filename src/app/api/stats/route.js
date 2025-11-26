import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { queryApi } from "@/lib/influxdb";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let where = {};
  if (session.user.role !== "admin") {
    where.userId = session.user.id;
  }

  const devices = await prisma.device.findMany({
    where,
  });

  const totalDevices = devices.length;
  const activeDevices = devices.filter(d => d.status === 'online').length;

  const org = process.env.INFLUXDB_ORG || 'my-org';
  const bucket = process.env.INFLUXDB_BUCKET || 'hems_metrics';
  
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "consumption")
      |> filter(fn: (r) => r._field == "value")
      |> sum()
  `;

  let totalConsumption = 0;
  
  try {
    const result = await new Promise((resolve, reject) => {
      let sum = 0;
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          sum += o._value;
        },
        error(error) {
          console.error('InfluxDB Query Error:', error);
          reject(error);
        },
        complete() {
          resolve(sum);
        },
      });
    });
    totalConsumption = result;
  } catch (e) {
    console.error("Failed to query InfluxDB", e);
  }

  // Chart Data Query (Daily Aggregation for last 7 days)
  const chartQuery = `
    from(bucket: "${bucket}")
      |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "consumption")
      |> filter(fn: (r) => r._field == "value")
      |> aggregateWindow(every: 1d, fn: sum, createEmpty: true)
  `;

  const chartData = [];
  
  try {
     await new Promise((resolve, reject) => {
      queryApi.queryRows(chartQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          const date = new Date(o._time);
          const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
          chartData.push({
            day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            consumption: o._value || 0,
            percentage: Math.min(((o._value || 0) / 100) * 100, 100)
          });
        },
        error(error) { reject(error); },
        complete() { resolve(); },
      });
    });
  } catch (e) {
    console.error("Failed to query InfluxDB Chart", e);
  }

  if (chartData.length === 0) {
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
      chartData.push({ day: dayName.charAt(0).toUpperCase() + dayName.slice(1), consumption: 0, percentage: 0 });
    }
  }

  let totalUsers = 0;
  let activeUsers = 0;
  if (session.user.role === 'admin') {
    totalUsers = await prisma.user.count();
    activeUsers = totalUsers; 
  }

  return NextResponse.json({
    totalUsers,
    activeUsers,
    totalDevices,
    activeDevices,
    totalConsumption: totalConsumption.toFixed(2) + " kWh",
    monthlyCost: "$" + (totalConsumption * 0.15).toFixed(2),
    averagePerUser: totalUsers ? (totalConsumption / totalUsers).toFixed(1) + " kWh" : "0 kWh",
    systemHealth: 98,
    chartData
  });
}
