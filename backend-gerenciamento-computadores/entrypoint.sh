#!/bin/bash
set -e

# Wait for the database to be ready
python -c "from src.main import wait_for_db; wait_for_db()"

# Apply database schema
# psql "$DATABASE_URL" -f /app/database_schema.sql

# Start Gunicorn
exec gunicorn --bind 0.0.0.0:5000 src.main:app
