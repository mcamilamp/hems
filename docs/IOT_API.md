# HEMS IoT Ingestion Contract

This document describes the HTTP contract between IoT devices (e.g. the Arduino UNO WiFi Rev2 firmware in `testArduinoWiFiIO`) and the HEMS backend.

## Authentication

Each `Device` row in PostgreSQL has a unique `apiToken` (UUID v4) generated when the device is created via the admin/user UI. The device authenticates with:

```
Authorization: Bearer <apiToken>
```

Tokens do not expire and are not rotated automatically. To rotate, recreate the device.

## Endpoints

### `POST /api/iot/data`

Push one or more measurement points. Two body shapes are accepted; both write `consumption` measurements to InfluxDB tagged with `deviceId` and `unit`.

#### Legacy single-value body (still supported)

```json
{ "value": 1.5, "unit": "kWh" }
```

`unit` defaults to `kWh` if omitted.

#### Multi-reading body (recommended for full firmware)

```json
{
  "readings": [
    { "value": 3.2,    "unit": "A"   },
    { "value": 120,    "unit": "V"   },
    { "value": 384,    "unit": "W"   },
    { "value": 0.0032, "unit": "kWh" }
  ]
}
```

**Allowed units:** `A`, `V`, `W`, `kWh`. Anything else returns 400.

**Limits:**

- `readings` length: 1 to 32.
- Per-reading sane caps: A ≤ 200, V ≤ 600, W ≤ 50000, kWh ≤ 100. Negative or non-finite values are rejected.

**Side effects per request:**

- All readings written to InfluxDB measurement `consumption`, tagged `deviceId=<device.id>` and `unit=<unit>`, field `value=<float>`.
- `Device.status` set to `"online"` and `updatedAt` bumped.

**Responses:**

| Status | Body                                       | Meaning                                  |
| ------ | ------------------------------------------ | ---------------------------------------- |
| 200    | `{ "success": true, "written": <n> }`      | Points enqueued and flush kicked off.    |
| 400    | `{ "message": "<reason>" }`                | Body validation failed.                  |
| 401    | `{ "message": "Unauthorized" }`            | Missing or malformed `Authorization`.    |
| 403    | `{ "message": "Invalid Token" }`           | Token does not match any device.         |
| 500    | `{ "message": "Internal Error" }`          | DB/Influx fault.                         |

### `GET /api/devices/{id}/latest` (session-protected, not for devices)

Returns the most recent value per unit for a device in the last 5 minutes:

```json
{
  "voltageRms": 120.1,
  "currentRms": 3.18,
  "powerW": 381.92,
  "energyKwh": 0.0032,
  "lastUpdate": "2026-05-06T15:42:11.000Z"
}
```

Any field is `null` if no point exists for that unit in the window. Used by the device-detail UI to render the live tiles.

## Sample curl

```bash
TOKEN="paste-device-apitoken-here"
HOST="http://localhost:3000"

# Multi-reading (recommended)
curl -X POST "$HOST/api/iot/data" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"readings":[
    {"value":3.2,"unit":"A"},
    {"value":120,"unit":"V"},
    {"value":384,"unit":"W"},
    {"value":0.0032,"unit":"kWh"}
  ]}'

# Legacy
curl -X POST "$HOST/api/iot/data" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":1.5,"unit":"kWh"}'
```

## Recommended posting cadence

- Default: one POST every 30 s with `[A, V, W, kWh]` (4 readings).
- Min cadence: 5 s (the backend can absorb more, but flushes happen per request).
- During WiFi outage, buffer up to ~10 readings on-device and flush on reconnect.

## Energy accounting

`kWh` values are **deltas** since the last successful POST, not cumulative. The backend stores them as-is; aggregation (sum over time) is the dashboard's responsibility. If a device crashes and loses an unflushed delta, that energy is lost — accept that trade-off rather than try to persist counters in EEPROM for the MVP.
