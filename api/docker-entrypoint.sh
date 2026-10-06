#!/bin/sh
# Migrate, seed (plans + first admin; demo data if SEED_DEMO_DATA=true), then start.
set -e
alembic upgrade head
python -m app.seed
exec "$@"
