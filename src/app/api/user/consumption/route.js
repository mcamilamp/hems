import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { queryApi, ENERGY_FILTER, FLUX_LOCATION, roundKwh } from "@/lib/influxdb";
import { getCompanyForUser, estimateLast30Days } from "@/lib/tariff";

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
      ${ENERGY_FILTER}
      |> filter(fn: (r) => ${deviceFilter})
      |> sum()
  `;

  let totalMonth = 0;
  try {
    await new Promise((resolve) => {
      queryApi.queryRows(totalQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          // Influx devuelve UNA FILA POR SERIE (aca: una por deviceId). Con
          // `=` en vez de `+=` cada fila pisaba a la anterior y el total
          // quedaba siendo el de un solo dispositivo, elegido al azar.
          totalMonth += o._value || 0;
        },
        error(e) { console.error(e); resolve(); },
        complete() { resolve(); }
      });
    });
  } catch (e) {
    console.error("Failed total query", e);
  }

  // Tarifa vigente por tramo en vez de una constante: ver src/lib/tariff.js.
  const company = await getCompanyForUser(session.user.id);
  const estimate = await estimateLast30Days({ company, deviceIds });
  const totalCost = estimate.estimatedCostCop;
  const averageDay = totalMonth / 30;

  // Last 7 days daily consumption
  // `group()` sin columnas colapsa TODAS las series en una sola tabla. Sin
  // eso, aggregateWindow emite una fila por serie por dia y el callback las
  // acumulaba todas juntas: de ahi salia el 106605 del grafico.
  const historyQuery = `
    ${FLUX_LOCATION}

    from(bucket: "${bucket}")
      |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "consumption")
      ${ENERGY_FILTER}
      |> filter(fn: (r) => ${deviceFilter})
      |> group()
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
            // Se redondea ACA y no en el componente: el contrato de la API
            // es el lugar donde el numero se vuelve presentable. Asi ninguna
            // vista recibe un float crudo como 106605.04786800002.
            history.push({
              day: dayNames[dayIndex],
              value: roundKwh(dayMap[dayIndex])
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
      ${ENERGY_FILTER}
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

          // Un porcentaje es 0..100 POR DEFINICION. Se acota en el origen:
          // si el dato vuelve a corromperse, la barra de la UI se llena y
          // listo, no se escapa de la tarjeta pintando por encima de otra.
          const share = (kwh) =>
            totalMonth > 0
              ? Math.min(100, Math.max(0, Math.round((kwh / totalMonth) * 100)))
              : 0;

          sorted.forEach(d => {
            breakdown.push({
              device: d.device,
              percentage: share(d.kwh),
              kwh: roundKwh(d.kwh)
            });
          });

          // Epsilon en vez de `> 0`: la resta de floats deja basura del orden
          // de 1e-15 y aparecia un "Otros 0 kWh" fantasma.
          if (otherTotal > 0.005) {
            breakdown.push({
              device: "Otros",
              percentage: share(otherTotal),
              kwh: roundKwh(otherTotal)
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
    // En COP y sin centavos: es una estimacion, no un valor facturado.
    totalCost: Math.round(totalCost),
    tariff: estimate.tariff,
    uncoveredKwh: estimate.uncoveredKwh,
    averageDay: parseFloat(averageDay.toFixed(2)),
    history,
    breakdown
  });
}

