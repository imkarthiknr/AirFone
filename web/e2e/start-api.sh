#!/usr/bin/env sh
# Fresh SQLite database with demo data, then the API on :8000 (used by Playwright).
set -e
cd "$(dirname "$0")/../../api"
export DATABASE_URL="sqlite:///./e2e.db"
rm -f e2e.db
uv run alembic upgrade head
uv run python -m app.seed --demo
exec uv run uvicorn app.main:app --port 8000
