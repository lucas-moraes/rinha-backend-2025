#!/usr/bin/env bash
set -e

until PGPASSWORD="$POSTGRES_PASSWORD" psql -h postgres -U "$POSTGRES_USER" -c '\q'; do
  echo "Waiting for Postgres..."
  sleep 1
done

echo "🌀 Sincronizando schema com o Prisma (db push)..."
npx prisma db push --skip-generate

echo "🚀 Iniciando cluster de servidores HTTP..."
exec node dist/cluster.js
