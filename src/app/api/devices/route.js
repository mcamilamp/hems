import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { v4 as uuidv4 } from 'uuid';
import { queryApi, ENERGY_FILTER, roundKwh } from "@/lib/influxdb";

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

  const bucket = process.env.INFLUXDB_BUCKET || 'hems_metrics';

  // Antes esto era `last()` sin filtro de unidad ni group: devolvia el ULTIMO
  // punto de la unidad que llegara al final, asi que la tarjeta podia mostrar
  // "120 V" etiquetado como consumo. Y toda la UI hace
  // parseFloat(consumption.replace(" kWh","")) asumiendo kWh: leia 120 y lo
  // trataba como energia.
  //
  // Ahora suma los kWh de la ultima hora por dispositivo. Eso SI es una
  // magnitud con significado, y ordenable (la usa TopDevices).
  const deviceFilter = devices.map(d => `r.deviceId == "${d.id}"`).join(" or ");

  const energyByDevice = {};

  if (deviceFilter) {
    const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: -1h)
        |> filter(fn: (r) => r._measurement == "consumption")
        ${ENERGY_FILTER}
        |> filter(fn: (r) => ${deviceFilter})
        |> group(columns: ["deviceId"])
        |> sum()
    `;

    try {
      await new Promise((resolve) => {
        queryApi.queryRows(fluxQuery, {
          next(row, tableMeta) {
            const o = tableMeta.toObject(row);
            if (o.deviceId) {
              energyByDevice[o.deviceId] =
                (energyByDevice[o.deviceId] || 0) + (o._value || 0);
            }
          },
          error(error) { console.error(error); resolve(); },
          complete() { resolve(); },
        });
      });
    } catch (e) {
      console.error("InfluxDB Error", e);
    }
  }

  const devicesWithConsumption = devices.map(d => ({
    ...d,
    consumption: `${roundKwh(energyByDevice[d.id]).toFixed(2)} kWh`
  }));

  return NextResponse.json(devicesWithConsumption);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { name, type, location, userId, nominalVoltage } = body;

  const targetUserId = (session.user.role === "admin" && userId) ? userId : session.user.id;

  const data = {
    name,
    type,
    location,
    userId: targetUserId,
    apiToken: uuidv4(),
    status: "offline"
  };
  if (nominalVoltage === 120 || nominalVoltage === 230) {
    data.nominalVoltage = nominalVoltage;
  }

  const device = await prisma.device.create({ data });

  return NextResponse.json(device);
}
