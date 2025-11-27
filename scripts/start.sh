#!/bin/sh

set -e

echo "Iniciando aplicación HEMS..."

wait_for_db() {
  echo "Esperando a que la base de datos esté lista..."
  max_attempts=30
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if npx prisma db push --accept-data-loss --skip-generate > /dev/null 2>&1 || \
       npx prisma migrate status > /dev/null 2>&1; then
      echo "Base de datos lista"
      return 0
    fi
    
    attempt=$((attempt + 1))
    if [ $((attempt % 5)) -eq 0 ]; then
      echo "   Intento $attempt/$max_attempts - Base de datos no disponible, esperando..."
    fi
    sleep 2
  done
  
  echo "No se pudo conectar a la base de datos después de $max_attempts intentos"
  echo "   Intentando continuar de todas formas..."
  return 1
}

wait_for_db || true

echo "Aplicando esquema de base de datos..."
if npx prisma migrate deploy > /dev/null 2>&1; then
  echo "Migraciones aplicadas"
else
  echo "Aplicando esquema con db push..."
  npx prisma db push --accept-data-loss --skip-generate || {
    echo "Error aplicando esquema, continuando..."
  }
fi

echo "Verificando y creando usuario admin..."
if node prisma/seed.js; then
  echo "Seed completado"
else
  echo "Error durante el seed, continuando..."
fi

echo "Inicialización completada"
echo "Iniciando servidor de desarrollo..."

exec npm run dev

