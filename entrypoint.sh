#!/usr/bin/env bash
set -e

echo "🌀 Sincronizando schema com o Prisma (db push)..."
npx prisma db push \
  --schema=prisma/schema.prisma \
  --skip-generate

echo "✨ Gerando Prisma Client..."
npx prisma generate \
  --schema=prisma/schema.prisma
