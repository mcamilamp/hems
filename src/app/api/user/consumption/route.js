import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
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
    select: { id: true, name: true }
  });

  const deviceIds = devices.map(d => d.id);
  
  if (deviceIds.length === 0) {
    return NextResponse.json({
      totalMonth: 0,
      totalCost: 0,
      averageDay: 0,
      history: [],
      breakdown: []
    });
  }

  const org = process.env.INFLUXDB_ORG || 'my-org';
  const bucket = process.env.INFLUXDB_BUCKET || 'hems_metrics';
  
  const deviceFilter = deviceIds.map(id => `r.deviceId == "${id}"`).join(" or ");
  
  // Total consumption last 30 days
  const totalQuery = `
    from(bucket: "${bucket}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "consumption")
      |> filter(fn: (r) => r._field == "value")
      |> filter(fn: (r) => ${deviceFilter})
      |> sum()
  `;

  let totalMonth = 0;
  try {
    await new Promise((resolve) => {
      queryApi.queryRows(totalQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          totalMonth = o._value || 0;
        },
        error(e) { console.error(e); resolve(); },
        complete() { resolve(); }
      });
    });
  } catch (e) {
    console.error("Failed total query", e);
  }

  const totalCost = totalMonth * 0.15;
  const averageDay = totalMonth / 30;

  // Last 7 days daily consumption
  const historyQuery = `
    from(bucket: "${bucket}")
      |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "consumption")
      |> filter(fn: (r) => r._field == "value")
      |> filter(fn: (r) => ${deviceFilter})
      |> aggregateWindow(every: 1d, fn: sum, createEmpty: true)
  `;

  const history = [];
  try {
    await new Promise((resolve) => {
      const dayMap = {};
      queryApi.queryRows(historyQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          const date = new Date(o._time);
          const dayIndex = date.getDay();
          const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
          dayMap[dayIndex] = (dayMap[dayIndex] || 0) + (o._value || 0);
        },
        error(e) { console.error(e); resolve(); },
        complete() {
          const today = new Date();
          for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dayIndex = d.getDay();
            const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
            history.push({
              day: dayNames[dayIndex],
              value: dayMap[dayIndex] || 0
            });
          }
          resolve();
        }
      });
    });
  } catch (e) {
    console.error("Failed history query", e);
  }

  // Breakdown by device
  const breakdownQuery = `
    from(bucket: "${bucket}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "consumption")
      |> filter(fn: (r) => r._field == "value")
      |> filter(fn: (r) => ${deviceFilter})
      |> group(columns: ["deviceId"])
      |> sum()
  `;

  const breakdown = [];
  try {
    await new Promise((resolve) => {
      const deviceMap = {};
      queryApi.queryRows(breakdownQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          const deviceId = o.deviceId;
          deviceMap[deviceId] = (deviceMap[deviceId] || 0) + (o._value || 0);
        },
        error(e) { console.error(e); resolve(); },
        complete() {
          let otherTotal = 0;
          const sorted = Object.entries(deviceMap)
            .map(([deviceId, kwh]) => {
              const device = devices.find(d => d.id === deviceId);
              return {
                device: device?.name || "Desconocido",
                kwh: kwh || 0
              };
            })
            .sort((a, b) => b.kwh - a.kwh)
            .slice(0, 3);
          
          const topThreeTotal = sorted.reduce((sum, d) => sum + d.kwh, 0);
          otherTotal = totalMonth - topThreeTotal;
          
          sorted.forEach(d => {
            breakdown.push({
              device: d.device,
              percentage: totalMonth > 0 ? Math.round((d.kwh / totalMonth) * 100) : 0,
              kwh: Math.round(d.kwh)
            });
          });
          
          if (otherTotal > 0) {
            breakdown.push({
              device: "Otros",
              percentage: Math.round((otherTotal / totalMonth) * 100),
              kwh: Math.round(otherTotal)
            });
          }
          
          resolve();
        }
      });
    });
  } catch (e) {
    console.error("Failed breakdown query", e);
  }

  return NextResponse.json({
    totalMonth: parseFloat(totalMonth.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    averageDay: parseFloat(averageDay.toFixed(2)),
    history,
    breakdown
  });
}

