#!/bin/sh
set -e 

echo "Running database migrations..."
# Directly using the binary via npx
npx medusa db:migrate

echo "Attempting to seed database..."
# Executing the specific seed script directly
npx medusa exec ./src/scripts/seed.ts || echo "Seed failed or already exists, skipping..."

echo "Starting Medusa in development mode..."
# Use 'medusa develop' directly to ensure HMR works correctly in Docker
exec npx medusa develop