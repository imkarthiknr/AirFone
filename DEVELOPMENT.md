# Development Guide

How to run, test and extend AirFone. For an overview, see the [README](README.md).

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Configuration](#configuration)
- [Database, migrations and seed data](#database-migrations-and-seed-data)
- [API design](#api-design)
- [Web app design](#web-app-design)
- [Security model](#security-model)
- [Testing](#testing)
- [Code style](#code-style)
- [Continuous integration](#continuous-integration)
- [Common tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

## Prerequisites

| Tool | Version |
| --- | --- |
| Node.js | `^20.19.0`, `^22.12.0` or `>=24` (`.nvmrc` pins 22) |
| Python | 3.11+ (`api/.python-version` pins 3.13) |
| [uv](https://docs.astral.sh/uv/) | 0.5+ (Windows: `powershell -c "irm https://astral.sh/uv/install.ps1 \| iex"`) |
| Docker + Compose v2 | Optional, for MySQL and the full stack |

## Setup

```bash
npm install        # root: concurrently
npm run setup      # api: uv sync, migrate SQLite, seed demo data · web: npm ci
npm run dev        # api :8000 (reload) + web :4200
```

| URL | What |
| --- | --- |
| http://localhost:4200 | Web app (proxies `/api` → :8000, see `web/proxy.conf.json`) |
| http://localhost:8000/docs | Swagger UI for the API |
| http://localhost:4200/admin/login | Admin console (`admin` / `admin12345`) |

To run each part separately:

```bash
cd api && uv run uvicorn app.main:app --reload --port 8000
cd web && npm start
```

To use MySQL locally, run `docker compose up -d db`, publish port 3306 on the `db` service, and set `DATABASE_URL=mysql+pymysql://airfone:airfone@localhost:3306/airfone` in `api/.env`.

## Configuration

The API reads its settings from environment variables or `api/.env` (see `api/.env.example` and `app/core/config.py`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./airfone.db` | SQLAlchemy URL (`mysql+pymysql://…` for MySQL) |
| `SECRET_KEY` | dev placeholder | JWT signing. **Set in every shared environment** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `120` | Session length |
| `PASSWORD_RESET_EXPIRE_MINUTES` | `30` | Reset link lifetime |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin` / `admin12345` | First admin, created by the seed when no admin exists |
| `WEB_BASE_URL` | `http://localhost:4200` | Used to build reset links |
| `CORS_ORIGINS` | `["http://localhost:4200"]` | JSON list. Only needed when the web app calls the API cross-origin |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM` | empty | Optional real e-mail delivery |
| `SEED_DEMO_DATA` | `false` | `python -m app.seed` adds demo customers when `true` (Compose sets it) |

The web app has no runtime configuration. It calls `/api/v1`, which is proxied by the Angular dev server locally and by nginx in Docker.

## Database, migrations and seed data

```bash
cd api
uv run alembic upgrade head                            # apply migrations
uv run alembic revision --autogenerate -m "message"    # after changing app/models.py
uv run alembic check                                   # fails if models ≠ migrations
uv run python -m app.seed [--demo]                     # idempotent
```

**Tables:** `customers`, `admins`, `plans`, `payments`, `bills`, `tickets`, `feedback`, `notifications`.

- Enums are stored as short strings, which keeps them portable across SQLite and MySQL.
- `bills` snapshots the plan name, benefits and price, so later plan edits never rewrite history.
- The plan catalogue in `app/seed.py` is the original 2020 one, cleaned up.
- Demo customers `9000000001`–`9000000005` are fictional, with password `airfone123`.

`tests/test_migrations_and_seed.py` upgrades a fresh database, runs `alembic check`, downgrades, and verifies the seed is idempotent.

## API design

```
app/
├── main.py              create_app(): CORS, error handler, /api/v1 routers, /health
├── api/
│   ├── deps.py          DbSession, OptionalCustomer, CurrentCustomer, CurrentAdmin
│   ├── errors.py        ApiError → {"detail": "...", "fields": {...}}
│   └── routes/          auth · plans · me · feedback · admin
├── services/            business logic; no FastAPI imports
├── core/                config, security, validators
├── models.py · schemas.py · seed.py
```

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/admin/login`, `/auth/forgot-password`, `/auth/reset-password` |
| Plans | `GET /plans?category=`, `GET /plans/{id}` |
| My account | `GET /me` (summary), `PUT /me/profile`, `POST /me/password`, `GET /me/bills[/{id}]`, `POST /me/recharges`, `GET/POST /me/tickets`, `GET /me/notifications` |
| Feedback | `POST /feedback` (signed in or anonymous) |
| Admin | `GET/PUT /admin/me`, `GET /admin/stats`, `GET /admin/customers`, `GET/PUT/DELETE /admin/customers/{id}`, `GET /admin/customers/{id}/bills`, `POST /admin/customers/{id}/password-reset`, `GET /admin/tickets[/{id}]`, `POST /admin/tickets/{id}/respond`, `GET /admin/billing-report[.csv]`, `GET /admin/feedback`, `GET /admin/notifications` |

All paths are under `/api/v1`. The full schema is at `/docs` while the API is running.

Key rules:

- **Registration** allocates a random, unused 10-digit number starting with 6–9, as the original did.
- **Recharge:** the plan category must equal the customer's connection type (`409` otherwise). The card goes through `services/payments.py`, and a failed payment rolls back so no bill or payment row is created. Each recharge sends an e-mail and an SMS to the outbox.
- **Tickets** go to the agent with the fewest open tickets (the original picked one at random). An admin reply resolves the ticket and e-mails the customer.
- **Errors:** validation returns FastAPI's `422` list. Domain errors return `{"detail", "fields"?}`, and the web app maps `fields` onto form controls.

## Web app design

```
web/src/app/
├── core/       models.ts, api.ts (API_URL), http-error.ts, auth/, services/
├── layout/     PublicLayoutComponent (header/footer), AdminLayoutComponent (sidebar)
├── shared/     plan-card, field-error, logo, validators (Verhoeff, Luhn, expiry, age)
└── pages/      public/ customer/ admin/  (one lazy-loaded route each)
```

- **Standalone, zoneless, signals** for view state. RxJS handles request streams such as search with `debounceTime` and `switchMap`.
- **Auth:** `AuthService` keeps `{token, role, label}` in a signal, persisted to `sessionStorage`. `authInterceptor` attaches the bearer token to `/api` calls and signs out on `401`. `customerGuard`, `adminGuard` and `guestGuard` protect routes and preserve `returnUrl`, with local paths only.
- **Forms** are reactive forms with shared validators. `<app-field-error>` renders messages, and `applyServerErrors()` puts API field errors on the right inputs.
- **Route params and query params** bind to component inputs (`withComponentInputBinding`).
- **Accessibility:** labelled controls, `aria-invalid`, live regions for alerts and toasts, a skip link, visible focus, and reduced-motion support.

The route map from the 2020 app is documented at the top of `web/src/app/app.routes.ts`.

## Security model

| Concern | How it's handled |
| --- | --- |
| Passwords | bcrypt. Over-long (>72 bytes) passwords rejected. Login timing equalised for unknown users |
| Sessions | HS256 JWTs carrying `sub` and `role`. Admin and customer tokens are not interchangeable (`403` and `401`) |
| Password reset | Signed token with a fingerprint of the current hash, so it is single-use and expires. `forgot-password` always returns `202`, so accounts can't be probed |
| Payments | Card number and CVV are validated, never stored. Only brand and last four digits are kept |
| Aadhaar | Verhoeff-validated. Only the last four digits are stored and shown masked |
| SQL | ORM with bound parameters only. `LIKE` wildcards are escaped in search |
| Secrets | Environment variables only. `.env` is gitignored |
| Web | Single origin via proxy. nginx sets `X-Content-Type-Options`, `X-Frame-Options` and `Referrer-Policy` |

## Testing

```bash
cd api && uv run pytest                    # 41 tests on SQLite
TEST_DATABASE_URL=mysql+pymysql://airfone:airfone@127.0.0.1:3306/airfone_test uv run pytest
cd web && npm test                         # 20 Vitest tests
cd web && npx playwright install chromium && npm run e2e   # 4 end-to-end journeys
```

| Suite | Covers |
| --- | --- |
| `api/tests/test_auth.py` | Registration rules, masked Aadhaar, duplicate e-mail, login, role separation, reset flow (single use), profile and password |
| `api/tests/test_recharge.py` | Catalogue, recharge success, card never stored, connection-type rule, Luhn/expiry/CVV, decline creates nothing, bill privacy |
| `api/tests/test_support.py` | Ticket assignment balancing, feedback (anonymous and linked), customer inbox |
| `api/tests/test_admin.py` | Customer search, filter, update, deactivate, delete; reset link; ticket response; billing report and CSV; stats; outbox; admin profile |
| `api/tests/test_validators.py`, `test_migrations_and_seed.py` | Verhoeff/Luhn/brand; migrations match models; seed idempotent |
| `web/**/*.spec.ts` | Validators, error mapping, auth (interceptor, guards, 401 logout, safe redirects), register, recharge, plans, admin tickets |
| `web/e2e/journeys.spec.ts` | Register → login → recharge (decline, then success) → bills; complaint raised → admin reply → customer sees it; admin search, update and billing CSV; guards and 404 |

Playwright starts the API itself (`web/e2e/start-api.sh`: a fresh SQLite database with demo data) and `ng serve`. Set `CHROMIUM_PATH` to use an existing browser.

## Code style

- **API:** Ruff for lint and format (`uv run ruff check --fix . && uv run ruff format .`, 100-column lines).
- **Web:** Prettier (`npm run format --prefix web`).
- `.editorconfig` and `.gitattributes` keep LF line endings in the repository, so Windows checkouts don't show whole-file diffs.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/).

## Continuous integration

`.github/workflows/ci.yml`:

| Job | Checks |
| --- | --- |
| API · lint | `ruff check`, `ruff format --check` |
| API · SQLite | pytest on Python 3.11 and 3.13 |
| API · MySQL 8.4 | Migrate, `alembic check`, seed, then the full pytest suite on MySQL |
| Web | Prettier, e2e type-check, Vitest, production build |
| End-to-end | Playwright against the real API and web app |
| Docker | `docker compose up --build --wait` (MySQL + API + nginx). Smoke tests cover the SPA, plans, customer login, a recharge, admin stats and a restart |

## Common tasks

**Add a plan:** add it to `PLANS` in `api/app/seed.py` for new databases. For existing ones, add a data migration or an admin endpoint (see roadmap).

**Add an API field:** change `app/models.py`, run `alembic revision --autogenerate`, then update `app/schemas.py`, `web/src/app/core/models.ts`, the form or page, and the tests.

**Send real e-mail:** set the `SMTP_*` variables. The outbox will mark messages as delivered.

**Create another admin:**

```bash
cd api && uv run python -c "from app.db.session import SessionLocal; from app.services.admin import create_admin; create_admin(SessionLocal(), 'ops', 'a-strong-pass1')"
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Web shows "Cannot reach AirFone right now" | Start the API (`npm run dev`, or `uv run uvicorn …` on :8000) |
| `no such table: customers` | `cd api && uv run alembic upgrade head` |
| Can't log in as admin | The seed only creates the first admin when none exists. Check `ADMIN_USERNAME` and `ADMIN_PASSWORD`, or reset the database |
| Reset link points to the wrong host | Set `WEB_BASE_URL` |
| Playwright: port 8000 or 4200 already in use | Stop your dev servers first. Playwright starts its own |
| `npm install` fails with `reading 'edgesOut'` | Use `npm ci` (lockfiles are committed) or `npx npm@11 install` |

## Roadmap

- [ ] Plan management in the admin console (create, edit, retire plans)
- [ ] Recharge stacking (queue a new pack after the current one ends) and expiry reminders, from the original non-functional requirements
- [ ] A real payment gateway (e.g. Razorpay test mode) behind the `payments` service
- [ ] SMS provider integration behind `notifications._deliver_sms`
- [ ] Daily sales report e-mail for admins
- [ ] Rate limiting on auth endpoints and an account lockout policy
