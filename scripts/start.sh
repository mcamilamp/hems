#!/bin/sh

set -e

echo "Iniciando aplicación HEMS..."

wait_for_db() {
  echo "Esperando a que la base de datos esté lista..."
  max_attempts=30
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    # Ping real y sin efectos secundarios. Antes esto usaba `db push`, que
    # ademas de aplicar el esquema como efecto colateral llevaba el flag
    # --skip-generate (inexistente en Prisma 7): fallaba siempre, igual que el
    # `migrate status` de respaldo, y el arranque perdia los 60s completos del
    # bucle aunque la base estuviera lista desde el primer intento.
    if echo "SELECT 1;" | npx prisma db execute --stdin > /dev/null 2>&1; then
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
# El proyecto no versiona migraciones: se decide por lo que hay en disco en vez
# de intentar `migrate deploy` a ciegas y usar su fallo como senal.
if [ -d prisma/migrations ]; then
  echo "Aplicando migraciones..."
  npx prisma migrate deploy || {
    echo "Error aplicando migraciones, continuando..."
  }
else
  echo "Sin migraciones versionadas: aplicando esquema con db push..."
  npx prisma db push --accept-data-loss || {
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

npm run build
npm start
