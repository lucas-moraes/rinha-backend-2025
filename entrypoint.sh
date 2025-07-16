#!/usr/bin/env bash
set -e

# 1) Espera o Postgres ficar pronto
until PGPASSWORD="$POSTGRES_PASSWORD" psql -h postgres -U "$POSTGRES_USER" -c '\q'; do
  echo "Waiting for Postgres..."
  sleep 1
done

# 2) Sincroniza o schema que está em src/domain/prisma/schema.prisma
echo "🌀 Sincronizando schema com o Prisma (db push)..."
npx prisma db push \
  --schema=src/domain/prisma/schema.prisma \
  --skip-generate

# (Opcional) Gera o client, também apontando pro mesmo schema
echo "✨ Gerando Prisma Client..."
npx prisma generate \
  --schema=src/domain/prisma/schema.prisma
