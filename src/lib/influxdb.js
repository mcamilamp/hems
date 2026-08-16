import { InfluxDB, Point } from '@influxdata/influxdb-client';

const url = process.env.INFLUXDB_URL || 'http://localhost:8086';
const token = process.env.INFLUXDB_TOKEN || 'my-super-secret-auth-token';
const org = process.env.INFLUXDB_ORG || 'my-org';
const bucket = process.env.INFLUXDB_BUCKET || 'hems_metrics';

export const influxDB = new InfluxDB({ url, token });
export const writeApi = influxDB.getWriteApi(org, bucket);
export const queryApi = influxDB.getQueryApi(org);

export { Point };

/*
 * La unidad NO es opcional en una query de consumo.
 *
 * El bridge escribe CUATRO puntos por POST -- A, V, W y kWh -- y los cuatro
 * comparten `_measurement == "consumption"` y `_field == "value"`. Lo unico
 * que los distingue es el tag `unit`. Una query que no filtra por unit suma
 * amperes con volts y con kilowatt-hora: no da un numero grande, da un
 * numero SIN SIGNIFICADO.
 *
 * Este filtro faltaba en todos los endpoints menos /api/devices/[id]/latest.
 * Vive aca, en un solo lugar, para que no se pueda volver a olvidar.
 */
export const ENERGY_UNIT = "kWh";

export const ENERGY_FILTER =
  `|> filter(fn: (r) => r._field == "value" and r.unit == "${ENERGY_UNIT}")`;

// Los kWh viajan como deltas: sumarlos da energia, pero los redondeos con
// Math.round() aplastan a 0 cualquier consumo menor a medio kWh. Un
// prototipo con un potenciometro vive justo en ese rango.
export function roundKwh(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

/*
 * Zona horaria de los agrupamientos por dia.
 *
 * aggregateWindow(every: 1d) corta en fronteras UTC por default, pero las
 * etiquetas del grafico salen de un new Date(...).getDay() que corre en la
 * zona del proceso. En America/Bogota (UTC-5) el balde "2026-08-10T00:00:00Z"
 * es Ago 9 a las 19:00 local => getDay() devuelve DOMINGO para la energia del
 * lunes. Todas las barras corridas un dia.
 *
 * Con `option location` los baldes arrancan a la medianoche LOCAL, y ahi si
 * coinciden con la etiqueta. Se toma la zona del proceso para que buckets y
 * labels no puedan divergir; HEMS_TIMEZONE permite forzarla.
 */
export const REPORT_TIMEZONE =
  process.env.HEMS_TIMEZONE ||
  Intl.DateTimeFormat().resolvedOptions().timeZone ||
  "UTC";

export const FLUX_LOCATION = `import "timezone"
option location = timezone.location(name: "${REPORT_TIMEZONE}")`;

