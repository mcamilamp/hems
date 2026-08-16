// Carga .env para correr el seed fuera de Docker. Dentro del contenedor el
// compose ya inyecta las variables y dotenv no encuentra archivo: no molesta.
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando seed de la base de datos...');

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: 'admin@example.com',
    },
  });

  if (existingAdmin) {
    console.log('Usuario admin ya existe, actualizando...');
    
    const hashedPassword = await bcrypt.hash('admin', 12);
    await prisma.user.update({
      where: {
        email: 'admin@example.com',
      },
      data: {
        name: 'Administrador',
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log('Usuario admin actualizado correctamente');
  } else {
    console.log('Creando usuario admin por defecto...');
    
    const hashedPassword = await bcrypt.hash('admin', 12);
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log('Usuario admin creado correctamente:', admin.email);
  }

  await seedTariff();
  await seedCompany();

  console.log('Seed completado!');
  console.log('Email: admin@example.com');
  console.log('Password: admin');
}

// Perfil tarifario del caso de estudio: mipyme comercial de Santa Marta
// atendida por Air-e, regulada, en nivel de tension 1.
const CASE_STUDY = {
  provider: 'Air-e',
  market: 'Magdalena',
  category: 'Comercial',
  voltageLevel: 'NT1',
};

/*
 * Tarifa de arranque para desarrollo.
 *
 * PROVISIONAL a proposito: el valor debe reemplazarse por el del cuadro
 * tarifario oficial antes de la sustentacion, y la UI muestra la marca para
 * que nadie lo presente como dato verificado. Solo se crea si no hay ninguna
 * tarifa cargada para esta combinacion: no pisa la que cargue el usuario.
 */
async function seedTariff() {
  const existing = await prisma.tariff.findFirst({ where: CASE_STUDY });

  if (existing) {
    console.log('Tarifa ya cargada, no se modifica');
    return;
  }

  await prisma.tariff.create({
    data: {
      ...CASE_STUDY,
      baseCuCopKwh: 890.26,
      contributionRate: 0.20,
      validFrom: new Date('2026-08-01T00:00:00Z'),
      validUntil: null,
      source: 'PROVISIONAL - pendiente de verificar contra el cuadro tarifario publicado por Air-e',
      provisional: true,
    },
  });

  console.log('Tarifa PROVISIONAL creada (CU 890.26 + 20% contribucion)');
}

async function seedCompany() {
  let company = await prisma.company.findFirst();

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Mipyme de prueba - Santa Marta',
        ...CASE_STUDY,
        exemptContribution: false,
      },
    });
    console.log('Empresa de prueba creada');
  }

  // Los usuarios sin empresa quedan en la del caso de estudio; sin esto no
  // habria contra que resolver la tarifa.
  const { count } = await prisma.user.updateMany({
    where: { companyId: null },
    data: { companyId: company.id },
  });

  if (count) console.log(`${count} usuario(s) asociados a "${company.name}"`);
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e.message);
    if (e.message && e.message.includes('datasource')) {
      console.log('Error de conexión a la base de datos, el seed se reintentará en el próximo inicio');
    }
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

