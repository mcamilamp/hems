/*
 * Crea (o reutiliza) el Device del prototipo fisico y deja su apiToken
 * en .env como HEMS_DEVICE_TOKEN, listo para que lo lea serial_bridge.js.
 *
 * Uso:
 *   node scripts/provision_device.js
 *
 * El token se escribe al .env pero NO se imprime completo en consola:
 * un token en un log es un token filtrado.
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const DEVICE_NAME = "Prototipo Potenciometro";
const ENV_PATH = path.join(__dirname, "..", ".env");
const ENV_KEY = "HEMS_DEVICE_TOKEN";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function upsertEnvVar(key, value) {
  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : "";
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, "m");

  if (re.test(content)) {
    content = content.replace(re, line);
  } else {
    if (content.length && !content.endsWith("\n")) content += "\n";
    content += `\n# Token del Device del prototipo (generado por provision_device.js)\n${line}\n`;
  }
  fs.writeFileSync(ENV_PATH, content, "utf8");
}

async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });

  if (!admin) {
    console.error("No existe admin@example.com. Corre primero: npm run seed");
    process.exit(1);
  }

  let device = await prisma.device.findFirst({
    where: { name: DEVICE_NAME, userId: admin.id },
  });

  if (device && device.apiToken) {
    console.log(`Reutilizando device existente: ${device.id}`);
  } else if (device) {
    device = await prisma.device.update({
      where: { id: device.id },
      data: { apiToken: crypto.randomUUID() },
    });
    console.log(`Device existente sin token; token regenerado: ${device.id}`);
  } else {
    device = await prisma.device.create({
      data: {
        name: DEVICE_NAME,
        type: "Electrodoméstico",
        location: "Laboratorio",
        serialNumber: `PROTO-${Date.now()}`,
        apiToken: crypto.randomUUID(),
        nominalVoltage: 120,
        status: "offline",
        userId: admin.id,
      },
    });
    console.log(`Device creado: ${device.id}`);
  }

  upsertEnvVar(ENV_KEY, device.apiToken);

  console.log("");
  console.log(`  Device ID : ${device.id}`);
  console.log(`  Token     : ${device.apiToken.slice(0, 8)}... (completo en .env)`);
  console.log(`  Dashboard : http://localhost:3000/admin/devices/${device.id}`);
  console.log("");
  console.log(`${ENV_KEY} escrito en .env`);
}

main()
  .catch((e) => {
    console.error("Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
