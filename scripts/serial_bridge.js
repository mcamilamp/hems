/*
 * Puente Serial -> API HEMS
 *
 * Lee las lineas JSON que el Arduino Uno WiFi Rev2 emite por USB y las
 * convierte en POSTs a /api/iot/data.
 *
 * Uso:
 *   node scripts/serial_bridge.js
 *
 * Configuracion por variables de entorno (ver .env):
 *   HEMS_DEVICE_TOKEN  (obligatoria)  apiToken del Device
 *   HEMS_SERIAL_PORT   (default COM3)
 *   HEMS_API_BASE      (default http://localhost:3000)
 *   HEMS_POST_MS       (default 2000) cadencia de envio
 *
 * El token NUNCA va hardcodeado aca: sale del entorno.
 */

require("dotenv").config();
const axios = require("axios");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const TOKEN = process.env.HEMS_DEVICE_TOKEN;
const PORT_PATH = process.env.HEMS_SERIAL_PORT || "COM3";
const API_BASE = process.env.HEMS_API_BASE || "http://localhost:3000";
// Segundo eslabon de la latencia. docs/IOT_API.md recomienda 5 s como
// cadencia minima, pero /api/iot/data no impone rate limit alguno y hace
// flush por request: a 2 s absorbe sin problema y le saca 3 s al retardo
// que se ve al girar la perilla. El acumulador de kWh de mas abajo hace
// que bajar la cadencia NO pierda energia: sigue sumando deltas.
const POST_MS = Number(process.env.HEMS_POST_MS || 2000);
const BAUD = 115200;

if (!TOKEN) {
  console.error("Falta HEMS_DEVICE_TOKEN en el entorno (.env).");
  console.error("Se obtiene de la pagina de detalle del dispositivo en el dashboard.");
  process.exit(1);
}

// ------------------------------------------------------------ acumulador
//
// El firmware muestrea cada 2 s pero posteamos cada 5 s: si tirasemos las
// muestras intermedias perderiamos su energia. La potencia es instantanea
// (vale la ultima), pero los kWh son un DELTA que se ACUMULA. Por eso el
// acumulador suma kwh y solo se limpia cuando el POST salio bien.

const acc = { kwh: 0, last: null, samples: 0 };

function ingest(sample) {
  acc.kwh += sample.kwh;
  acc.last = sample;
  acc.samples += 1;
}

function drain() {
  if (!acc.last) return null;
  const payload = {
    readings: [
      { value: Number(acc.last.a.toFixed(3)), unit: "A" },
      { value: Number(acc.last.v.toFixed(1)), unit: "V" },
      { value: Number(acc.last.w.toFixed(2)), unit: "W" },
      { value: Number(acc.kwh.toFixed(6)), unit: "kWh" },
    ],
    samples: acc.samples,
  };
  return payload;
}

function commit() {
  acc.kwh = 0;
  acc.samples = 0;
}

// ---------------------------------------------------------------- envio

async function post() {
  const drained = drain();
  if (!drained) return;

  const { samples, ...body } = drained;

  try {
    const res = await axios.post(`${API_BASE}/api/iot/data`, body, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      timeout: 8000,
    });
    const a = body.readings[0].value;
    const w = body.readings[2].value;
    const kwh = body.readings[3].value;
    console.log(
      `[${new Date().toLocaleTimeString()}] ${a} A | ${w} W | ${kwh} kWh ` +
        `(${samples} muestras) -> ${res.status} ${JSON.stringify(res.data)}`
    );
    commit();
  } catch (err) {
    // No llamamos commit(): la energia acumulada se conserva y se reintenta
    // en el proximo ciclo en lugar de perderse.
    const detail = err.response
      ? `${err.response.status} ${JSON.stringify(err.response.data)}`
      : err.message;
    console.error(`[${new Date().toLocaleTimeString()}] POST fallo: ${detail}`);
  }
}

// --------------------------------------------------------------- lectura

const port = new SerialPort({ path: PORT_PATH, baudRate: BAUD, autoOpen: false });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

port.open((err) => {
  if (err) {
    console.error(`No se pudo abrir ${PORT_PATH}: ${err.message}`);
    console.error("Revisa que la placa este conectada y que ningun monitor serial la tenga tomada.");
    process.exit(1);
  }
  // El puente USB del mEDBG no entrega datos sin DTR/RTS. Aprendido a golpes.
  port.set({ dtr: true, rts: true }, () => {
    console.log(`Escuchando ${PORT_PATH} @ ${BAUD} -> ${API_BASE} cada ${POST_MS} ms`);
  });
});

parser.on("data", (line) => {
  const text = line.trim();
  if (!text) return;

  // El firmware manda logs humanos con '#'. Solo nos interesa el JSON.
  if (!text.startsWith("{")) {
    console.log(`  arduino: ${text}`);
    return;
  }

  try {
    const s = JSON.parse(text);
    if ([s.a, s.v, s.w, s.kwh].some((n) => typeof n !== "number" || !Number.isFinite(n))) {
      console.warn(`  linea con campos invalidos, ignorada: ${text}`);
      return;
    }
    ingest(s);
  } catch {
    console.warn(`  linea no parseable, ignorada: ${text}`);
  }
});

port.on("error", (e) => console.error(`Error de puerto: ${e.message}`));
port.on("close", () => {
  console.error("Puerto cerrado. Saliendo.");
  process.exit(1);
});

setInterval(post, POST_MS);

process.on("SIGINT", () => {
  console.log("\nCerrando puente.");
  port.close(() => process.exit(0));
});
