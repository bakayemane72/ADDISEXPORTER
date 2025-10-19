#!/bin/sh
set -e

# Ensure the Prisma directory exists for the SQLite database
mkdir -p prisma

# Apply the Prisma schema to make sure the SQLite database exists and is up to date
npx prisma db push

if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database with demo data"
  npm run prisma:seed
fi

exec "$@"
