import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { queryApi } from "@/lib/influxdb";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, id: true } }
    }
  });

  if (!device) return NextResponse.json({ message: "Dispositivo no encontrado" }, { status: 404 });

  if (session.user.role !== 'admin' && device.userId !== session.user.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  // Fetch history from InfluxDB
  const bucket = process.env.INFLUXDB_BUCKET || 'hems_metrics';
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -24h)
      |> filter(fn: (r) => r._measurement == "consumption")
      |> filter(fn: (r) => r.deviceId == "${id}")
      |> filter(fn: (r) => r._field == "value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: 100)
  `;

  const consumptions = [];
  try {
    await new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          consumptions.push({
            value: o._value,
            unit: o.unit || 'kWh',
            timestamp: o._time
          });
        },
        error(error) { console.error(error); resolve(); },
        complete() { resolve(); },
      });
    });
  } catch (e) {
    console.error("InfluxDB Error", e);
  }

  return NextResponse.json({
    ...device,
    consumptions
  });
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const device = await prisma.device.findUnique({ where: { id } });
  if (!device) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (session.user.role !== 'admin' && device.userId !== session.user.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.device.update({
    where: { id },
    data: body
  });

  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const device = await prisma.device.findUnique({ where: { id } });
  if (!device) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (session.user.role !== 'admin' && device.userId !== session.user.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await prisma.device.delete({ where: { id } });

  return NextResponse.json({ message: "Deleted" });
}
