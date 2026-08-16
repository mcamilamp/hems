import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { queryApi, ENERGY_FILTER, roundKwh } from "@/lib/influxdb";
import { getCompanyForUser, estimateLast30Days } from "@/lib/tariff";
import { formatCop } from "@/lib/currency";

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

  const devices = await prisma.device.findMany({
    where: { userId: id }
  });

  const bucket = process.env.INFLUXDB_BUCKET || 'hems_metrics';
  
  const deviceIds = devices.map(d => `r.deviceId == "${d.id}"`).join(" or ");

  // Mismo arreglo que en /api/devices: era `last()` sin filtro de unidad, asi
  // que el "consumo" del dispositivo podia ser un voltaje. Ahora son los kWh
  // de las ultimas 2 h, sumados por dispositivo.
  const energyByDevice = {};

  if (deviceIds.length > 0) {
    const lastQuery = `
      from(bucket: "${bucket}")
        |> range(start: -2h)
        |> filter(fn: (r) => r._measurement == "consumption")
        ${ENERGY_FILTER}
        |> filter(fn: (r) => ${deviceIds})
        |> group(columns: ["deviceId"])
        |> sum()
    `;

    try {
      await new Promise((resolve) => {
         queryApi.queryRows(lastQuery, {
          next(row, tableMeta) {
            const o = tableMeta.toObject(row);
            if (o.deviceId) {
              energyByDevice[o.deviceId] =
                (energyByDevice[o.deviceId] || 0) + (o._value || 0);
            }
          },
          error(e) { console.error(e); resolve(); },
          complete() { resolve(); }
         });
      });
    } catch(e) {}
  }

  const devicesWithConsumption = devices.map(d => ({
    ...d,
    consumption: roundKwh(energyByDevice[d.id]).toFixed(2) + " kWh"
  }));

  let totalConsumption = 0;

  if (deviceIds.length > 0) {
    const sumQuery = `
      from(bucket: "${bucket}")
        |> range(start: -30d)
        |> filter(fn: (r) => r._measurement == "consumption")
        ${ENERGY_FILTER}
        |> filter(fn: (r) => ${deviceIds})
        |> sum()
    `;
    try {
      await new Promise((resolve) => {
         queryApi.queryRows(sumQuery, {
          next(row, tableMeta) {
            const o = tableMeta.toObject(row);
            // `+=`, no `=`: una fila por dispositivo. Con `=` el total del
            // usuario era el de un solo dispositivo elegido al azar.
            totalConsumption += o._value || 0;
          },
          error(e) { console.error(e); resolve(); },
          complete() { resolve(); }
         });
      });
    } catch(e) {}
  }

  const company = await getCompanyForUser(id);
  const estimate = await estimateLast30Days({
    company,
    deviceIds: devices.map((d) => d.id),
  });

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
      // La tarifa es la de la empresa del usuario CONSULTADO, no la del admin
      // que esta mirando la ficha.
      monthlyCost: formatCop(estimate.estimatedCostCop),
      estimatedCostCop: estimate.estimatedCostCop,
      tariff: estimate.tariff,
      savingsPercentage: 15
    }
  });
}
