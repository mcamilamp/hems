import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { queryApi, ENERGY_FILTER, FLUX_LOCATION, roundKwh } from "@/lib/influxdb";
import { getCompanyForUser, estimateLast30Days } from "@/lib/tariff";
import { formatCop } from "@/lib/currency";

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
  
  // Prisma ya limita los dispositivos al usuario, pero la query a Influx no
  // tenia filtro de deviceId: un usuario comun sumaba el consumo de los
  // dispositivos de TODOS. Con un solo device no se nota; sigue estando mal.
  const deviceFilter = devices.map(d => `r.deviceId == "${d.id}"`).join(" or ");

  // Energia y costo salen del mismo servicio: el costo ya no es un `* 0.15`
  // suelto, sino la tarifa vigente en cada tramo del periodo (src/lib/tariff.js).
  const company = await getCompanyForUser(session.user.id);
  const estimate = await estimateLast30Days({
    company,
    deviceIds: devices.map((d) => d.id),
  });

  const totalConsumption = estimate.totalKwh;

  // Chart Data Query (Daily Aggregation for last 7 days)
  // `group()` colapsa las series en una sola tabla: sin eso aggregateWindow
  // emitia una fila por dispositivo por dia y el chart recibia 4 veces mas
  // barras que dias.
  const chartQuery = `
    ${FLUX_LOCATION}

    from(bucket: "${bucket}")
      |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "consumption")
      ${ENERGY_FILTER}
      |> filter(fn: (r) => ${deviceFilter})
      |> group()
      |> aggregateWindow(every: 1d, fn: sum, createEmpty: true)
  `;

  const chartData = [];

  if (deviceFilter) {
    try {
      await new Promise((resolve, reject) => {
        queryApi.queryRows(chartQuery, {
          next(row, tableMeta) {
            const o = tableMeta.toObject(row);
            const date = new Date(o._time);
            const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
            chartData.push({
              day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
              consumption: roundKwh(o._value)
            });
          },
          error(error) { reject(error); },
          complete() { resolve(); },
        });
      });
    } catch (e) {
      console.error("Failed to query InfluxDB Chart", e);
    }
  }

  // La altura de una barra es RELATIVA al pico de la serie, no a un 100
  // hardcodeado. Antes `(v / 100) * 100` asumia que 100 kWh era el techo:
  // con un prototipo que mide decimas, todas las barras quedaban en 0%.
  const peak = Math.max(0, ...chartData.map((d) => d.consumption));
  for (const d of chartData) {
    d.percentage = peak > 0 ? Math.min(100, (d.consumption / peak) * 100) : 0;
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
    // Estimacion, no factura: se acompana de la tarifa usada para que la
    // pantalla pueda mostrar de donde sale el numero.
    monthlyCost: formatCop(estimate.estimatedCostCop),
    estimatedCostCop: estimate.estimatedCostCop,
    tariff: estimate.tariff,
    uncoveredKwh: estimate.uncoveredKwh,
    averagePerUser: totalUsers ? (totalConsumption / totalUsers).toFixed(1) + " kWh" : "0 kWh",
    systemHealth: 98,
    chartData
  });
}
