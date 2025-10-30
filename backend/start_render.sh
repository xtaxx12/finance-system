#!/bin/bash
set -o errexit

echo "Starting Gunicorn server..."

# Start Gunicorn
exec gunicorn finance_api.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 2 \
    --timeout 120 \
    --log-level info \
    --access-logfile - \
    --error-logfile -