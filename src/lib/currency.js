/*
 * Formato de moneda. Vive aparte de tariff.js a proposito: ese modulo importa
 * prisma y el cliente de Influx, asi que no puede entrar en un componente
 * "use client". Esto si.
 */

// El peso colombiano no se muestra con centavos en uso cotidiano, y el valor
// que formateamos es una ESTIMACION: los decimales darian una precision que el
// numero no tiene. `es-CO` ademas agrupa los miles con punto (1.068).
export function formatCop(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "$ 0";

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

/*
 * Fechas de vigencia.
 *
 * Una vigencia es una fecha de CALENDARIO, no un instante: el cuadro rige
 * "desde el 1 de agosto". Se guarda como 2026-08-01T00:00:00Z y formatearla en
 * hora local (America/Bogota, UTC-5) la corria al 31/7. Mismo problema que ya
 * documenta influxdb.js para los baldes del grafico, al reves: aca la fecha no
 * se ancla a la zona local, se lee tal cual fue cargada.
 */
export function formatTariffDate(value, options = {}) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("es-CO", { timeZone: "UTC", ...options });
}

// La tarifa SI lleva decimales: es un precio unitario publicado ($890,26/kWh),
// no un total estimado.
export function formatCopPerKwh(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "$ 0/kWh";

  const formatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

  return `${formatted}/kWh`;
}
