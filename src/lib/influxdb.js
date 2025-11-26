import { InfluxDB, Point } from '@influxdata/influxdb-client';

const url = process.env.INFLUXDB_URL || 'http://localhost:8086';
const token = process.env.INFLUXDB_TOKEN || 'my-super-secret-auth-token';
const org = process.env.INFLUXDB_ORG || 'my-org';
const bucket = process.env.INFLUXDB_BUCKET || 'hems_metrics';

export const influxDB = new InfluxDB({ url, token });
export const writeApi = influxDB.getWriteApi(org, bucket);
export const queryApi = influxDB.getQueryApi(org);

export { Point };

