const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

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

  console.log('Seed completado!');
  console.log('Email: admin@example.com');
  console.log('Password: admin');
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

