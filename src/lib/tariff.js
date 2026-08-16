/*
 * Estimacion economica del consumo.
 *
 * Una sola fuente de verdad por tipo de dato:
 *   InfluxDB   -> energia medida (serie temporal)
 *   PostgreSQL -> tarifas y sus vigencias (dato estructurado)
 *
 * El costo NO se guarda: se recalcula a partir de esas dos, que son
 * inmutables. Por eso el historico no se reescribe cuando cambia la tarifa
 * vigente -- cada intervalo usa la que estaba publicada en ESE momento.
 *
 *   costoEstimado = Σ  kWh(intervalo_i) × tarifaAplicada(intervalo_i)
 *
 * Reemplaza al `consumo * 0.15` que estaba copiado en cuatro archivos, sin
 * nombre, sin unidad, sin moneda y sin fecha.
 */
import prisma from "@/lib/prisma";
import { queryApi, ENERGY_FILTER, roundKwh } from "@/lib/influxdb";

const DEFAULT_PROFILE = {
  provider: "Air-e",
  market: "Magdalena",
  category: "Comercial",
  voltageLevel: "NT1",
  exemptContribution: false,
};

/*
 * Tarifa efectiva para un cliente.
 *
 * El cuadro tarifario publica el Costo Unitario (CU). La contribucion de
 * solidaridad se le suma solo a los usuarios NO exentos, y eso es un atributo
 * del cliente, no del cuadro: por eso se deriva aca y no se guarda en Tariff.
 */
export function appliedRateCopKwh(tariff, exemptContribution) {
  const cu = Number(tariff.baseCuCopKwh);
  if (exemptContribution) return cu;

  const rate = Number(tariff.contributionRate) || 0;
  return cu * (1 + rate);
}

export async function getCompanyForUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { company: true },
  });

  return user?.company ?? null;
}

// Perfil tarifario a usar: el de la empresa si existe, si no el default del
// caso de estudio. Nunca se cae: sin perfil igual hay que poder estimar.
export function profileOf(company) {
  if (!company) return { ...DEFAULT_PROFILE };

  return {
    provider: company.provider,
    market: company.market,
    category: company.category,
    voltageLevel: company.voltageLevel,
    exemptContribution: company.exemptContribution,
  };
}

/*
 * Tarifas cuya vigencia se solapa con [from, to). validUntil null = vigente
 * hasta hoy. Ordenadas por validFrom para poder recorrer el rango.
 */
export async function tariffsForRange(profile, from, to) {
  return prisma.tariff.findMany({
    where: {
      provider: profile.provider,
      market: profile.market,
      category: profile.category,
      voltageLevel: profile.voltageLevel,
      validFrom: { lt: to },
      OR: [{ validUntil: null }, { validUntil: { gt: from } }],
    },
    orderBy: { validFrom: "asc" },
  });
}

/*
 * Parte [from, to) en tramos, cada uno con la tarifa vigente durante ese
 * tramo. Un tramo sin tarifa cargada queda con tariff: null -- se reporta,
 * no se asume cero en silencio.
 */
export function splitByValidity(from, to, tariffs) {
  const segments = [];
  let cursor = new Date(from);

  for (const tariff of tariffs) {
    const start = new Date(Math.max(cursor, new Date(tariff.validFrom)));
    const end = tariff.validUntil
      ? new Date(Math.min(new Date(to), new Date(tariff.validUntil)))
      : new Date(to);

    if (start >= end) continue;

    // Hueco: nadie cubre desde el cursor hasta que arranca esta tarifa.
    if (start > cursor) {
      segments.push({ from: new Date(cursor), to: new Date(start), tariff: null });
    }

    segments.push({ from: start, to: end, tariff });
    cursor = end;
  }

  if (cursor < new Date(to)) {
    segments.push({ from: new Date(cursor), to: new Date(to), tariff: null });
  }

  return segments;
}

/*
 * kWh consumidos por un conjunto de dispositivos en un intervalo.
 * ENERGY_FILTER no es opcional: sin el se suman amperes con volts.
 */
export async function sumEnergyKwh(deviceIds, from, to) {
  if (!deviceIds?.length) return 0;

  const bucket = process.env.INFLUXDB_BUCKET || "hems_metrics";
  const deviceFilter = deviceIds.map((id) => `r.deviceId == "${id}"`).join(" or ");

  const flux = `
    from(bucket: "${bucket}")
      |> range(start: ${new Date(from).toISOString()}, stop: ${new Date(to).toISOString()})
      |> filter(fn: (r) => r._measurement == "consumption")
      ${ENERGY_FILTER}
      |> filter(fn: (r) => ${deviceFilter})
      |> sum()
  `;

  try {
    return await new Promise((resolve, reject) => {
      let sum = 0;
      queryApi.queryRows(flux, {
        next(row, tableMeta) {
          sum += tableMeta.toObject(row)._value || 0;
        },
        error(error) {
          console.error("InfluxDB energy query error:", error);
          reject(error);
        },
        complete() {
          resolve(sum);
        },
      });
    });
  } catch (e) {
    console.error("Failed to sum energy", e);
    return 0;
  }
}

/*
 * Estimacion completa de un periodo. Devuelve tambien los insumos (CU, tasa,
 * vigencia, fuente) porque la pantalla los muestra: una estimacion que declara
 * su supuesto es defendible; un numero suelto no.
 */
export async function estimateCost({ company, deviceIds, from, to }) {
  const profile = profileOf(company);
  const tariffs = await tariffsForRange(profile, from, to);
  const segments = splitByValidity(from, to, tariffs);

  let totalKwh = 0;
  let totalCost = 0;
  let uncoveredKwh = 0;
  const breakdown = [];

  for (const segment of segments) {
    const kwh = await sumEnergyKwh(deviceIds, segment.from, segment.to);
    totalKwh += kwh;

    if (!segment.tariff) {
      uncoveredKwh += kwh;
      continue;
    }

    const rate = appliedRateCopKwh(segment.tariff, profile.exemptContribution);
    totalCost += kwh * rate;

    breakdown.push({
      from: segment.from.toISOString(),
      to: segment.to.toISOString(),
      kwh: roundKwh(kwh),
      rateCopKwh: Math.round(rate * 100) / 100,
      costCop: Math.round(kwh * rate),
    });
  }

  // La tarifa "de referencia" que se muestra en pantalla es la del ultimo
  // tramo cubierto: la vigente al cierre del periodo consultado.
  const current = tariffs.length ? tariffs[tariffs.length - 1] : null;

  return {
    totalKwh: roundKwh(totalKwh),
    estimatedCostCop: Math.round(totalCost),
    // kWh que quedaron fuera de toda vigencia cargada. Si esto es > 0 la
    // estimacion esta incompleta y hay que decirlo, no maquillarlo.
    uncoveredKwh: roundKwh(uncoveredKwh),
    breakdown,
    tariff: current
      ? {
          provider: current.provider,
          market: current.market,
          category: current.category,
          voltageLevel: current.voltageLevel,
          baseCuCopKwh: Number(current.baseCuCopKwh),
          contributionRate: Number(current.contributionRate),
          exemptContribution: profile.exemptContribution,
          appliedRateCopKwh:
            Math.round(appliedRateCopKwh(current, profile.exemptContribution) * 100) / 100,
          validFrom: current.validFrom.toISOString(),
          validUntil: current.validUntil ? current.validUntil.toISOString() : null,
          source: current.source,
          provisional: current.provisional,
        }
      : null,
  };
}

/*
 * Atajo para las pantallas que muestran "el costo del mes": ultimos 30 dias,
 * el mismo rango que ya usaban stats y consumption.
 */
export async function estimateLast30Days({ company, deviceIds }) {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return estimateCost({ company, deviceIds, from, to });
}
