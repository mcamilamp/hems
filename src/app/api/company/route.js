import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { TARIFF_OPTIONS, isValidProfileField } from "@/lib/tariffOptions";
import { appliedRateCopKwh } from "@/lib/tariff";

/*
 * Solo esto es editable. `provider` y `market` tambien identifican la tarifa,
 * pero no varian entre clientes del prototipo (Air-e / Magdalena): son
 * contexto, no una preferencia. Se conservan tal como estan y no se aceptan
 * por body -- un campo que nadie edita es un campo que nadie puede romper.
 */
const EDITABLE_PROFILE_FIELDS = ["category", "voltageLevel"];

// Tarifa vigente hoy para el perfil. Se devuelve junto a la empresa para que
// la pantalla pueda avisar si la combinacion elegida no tiene cuadro cargado:
// sin eso el costo estimado daria 0 sin explicacion.
async function currentTariffFor(profile) {
  const now = new Date();

  return prisma.tariff.findFirst({
    where: {
      provider: profile.provider,
      market: profile.market,
      category: profile.category,
      voltageLevel: profile.voltageLevel,
      validFrom: { lte: now },
      OR: [{ validUntil: null }, { validUntil: { gt: now } }],
    },
    orderBy: { validFrom: "desc" },
  });
}

function serializeTariff(tariff, exemptContribution) {
  if (!tariff) return null;

  return {
    baseCuCopKwh: Number(tariff.baseCuCopKwh),
    contributionRate: Number(tariff.contributionRate),
    appliedRateCopKwh:
      Math.round(appliedRateCopKwh(tariff, exemptContribution) * 100) / 100,
    validFrom: tariff.validFrom.toISOString(),
    validUntil: tariff.validUntil ? tariff.validUntil.toISOString() : null,
    source: tariff.source,
    provisional: tariff.provisional,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { company: true },
  });

  const company = user?.company ?? null;

  return NextResponse.json({
    company,
    tariff: company ? serializeTariff(await currentTariffFor(company), company.exemptContribution) : null,
    options: TARIFF_OPTIONS,
  });
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { message: "El nombre de la empresa es obligatorio" },
        { status: 400 }
      );
    }

    for (const field of EDITABLE_PROFILE_FIELDS) {
      if (!isValidProfileField(field, body[field])) {
        return NextResponse.json(
          { message: `Valor no admitido para ${field}: "${body[field] ?? ""}"` },
          { status: 400 }
        );
      }
    }

    const data = {
      name: body.name.trim(),
      nit: body.nit?.trim() || null,
      category: body.category,
      voltageLevel: body.voltageLevel,
      exemptContribution: Boolean(body.exemptContribution),
    };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true },
    });

    // Un usuario sin empresa la crea al guardar; no hay pantalla aparte de
    // alta y tampoco tiene sentido pedirle dos pasos para lo mismo.
    const company = user?.companyId
      ? await prisma.company.update({ where: { id: user.companyId }, data })
      : await prisma.company.create({ data });

    if (!user?.companyId) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { companyId: company.id },
      });
    }

    return NextResponse.json({
      company,
      tariff: serializeTariff(await currentTariffFor(company), company.exemptContribution),
      options: TARIFF_OPTIONS,
    });
  } catch (error) {
    console.error("Company update error:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
