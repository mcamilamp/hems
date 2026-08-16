/*
 * Escenario de demostracion: crea dispositivos para un usuario y les inyecta
 * lecturas por la API real de ingesta, de modo que las pantallas queden con
 * datos en vez de en cero.
 *
 * Cada dispositivo dispara una de las tres reglas de buildAlerts()
 * (src/app/user/alerts/page.jsx):
 *
 *   offline            -> "Dispositivo desconectado"  (media)
 *   consumo > 5 kWh    -> "Consumo elevado"           (alta)
 *   0 < consumo < 1    -> "Consumo eficiente"         (info)
 *
 * Uso (con el servidor corriendo):
 *   npm run seed:demo
 *   npm run seed:demo -- otro@correo.com
 *
 * Es idempotente: reutiliza los dispositivos por nombre y solo agrega lecturas.
 * Los apiToken se usan en memoria y no se imprimen: un token en un log es un
 * token filtrado (misma regla que provision_device.js).
 */
require("dotenv").config();

const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const API_BASE = process.env.HEMS_API_BASE || "http://localhost:3000";
const OWNER_EMAIL = process.argv[2] || "user@example.com";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// kwh null = no se le manda ninguna lectura y queda offline a proposito.
const DEMO_DEVICES = [
  { name: "Aire Acondicionado", type: "HVAC", location: "Sala", kwh: null },
  { name: "Calefactor", type: "Electrodoméstico", location: "Cuarto", kwh: 6.4 },
  { name: "Lámpara LED", type: "Iluminación", location: "Cocina", kwh: 0.42 },
];

async function upsertDevice(spec, userId) {
  const existing = await prisma.device.findFirst({
    where: { name: spec.name, userId },
  });

  if (existing) {
    return existing.apiToken
      ? existing
      : prisma.device.update({
          where: { id: existing.id },
          data: { apiToken: crypto.randomUUID() },
        });
  }

  return prisma.device.create({
    data: {
      name: spec.name,
      type: spec.type,
      location: spec.location,
      serialNumber: `DEMO-${crypto.randomUUID().slice(0, 8)}`,
      apiToken: crypto.randomUUID(),
      nominalVoltage: 120,
      status: "offline",
      userId,
    },
  });
}

async function main() {
  const owner = await prisma.user.findUnique({ where: { email: OWNER_EMAIL } });

  if (!owner) {
    console.error(`No existe ${OWNER_EMAIL}. Corre primero: npm run seed`);
    process.exit(1);
  }

  console.log(`Sembrando escenario de demo para ${OWNER_EMAIL}...`);

  for (const spec of DEMO_DEVICES) {
    const device = await upsertDevice(spec, owner.id);

    if (spec.kwh === null) {
      // /api/iot/data es justo lo que marca "online": basta con no llamarlo.
      await prisma.device.update({
        where: { id: device.id },
        data: { status: "offline" },
      });
      console.log(`  ${spec.name.padEnd(20)} offline, sin lecturas`);
      continue;
    }

    const res = await fetch(`${API_BASE}/api/iot/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${device.apiToken}`,
      },
      body: JSON.stringify({ value: spec.kwh, unit: "kWh" }),
    });

    if (!res.ok) {
      throw new Error(`${spec.name}: HTTP ${res.status} ${await res.text()}`);
    }

    console.log(`  ${spec.name.padEnd(20)} ${spec.kwh} kWh enviados`);
  }

  const total = await prisma.device.count({ where: { userId: owner.id } });
  console.log(`\nListo. ${OWNER_EMAIL} tiene ${total} dispositivo(s).`);
}

main()
  .catch((e) => {
    console.error("Error:", e.message);
    console.error("Verifica que el servidor este corriendo en " + API_BASE);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
