#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e
set -u

echo "Starting Medusa Production Entrypoint..."

#Since we are inside the standalone build, 
# we call the local medusa binary
echo "Running database migrations..."
./node_modules/.bin/medusa db:migrate
echo "Migrations completed."

# 3. Start Medusa
# We use 'exec' so that Medusa becomes PID 1.
# This allows the process to receive OS signals (like SIGTERM) for graceful shutdowns.
# It will use the MEDUSA_WORKER_MODE defined in your .env.
echo "Starting Medusa in $MEDUSA_WORKER_MODE mode for a ${NODE_ENV} environment..."
exec ./node_modules/.bin/medusa start -H 0.0.0.0