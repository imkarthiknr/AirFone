# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project follows [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-10-06

A complete rebuild of the 2020 Team-4 project, with feature parity and a modern, secure, tested stack.

### Added

- `api/`: a FastAPI service replacing the two Flask apps. It has customer and admin JWT roles, Alembic migrations, a seed for plans, the first admin and fictional demo data, and a `/health` endpoint.
- Notifications outbox for every e-mail and SMS the system sends, with optional SMTP delivery via environment variables. Customers get an inbox and admins get an outbox view.
- Mock card gateway with Luhn, expiry and CVV checks and test cards for approve and decline.
- Password reset by one-time, expiring link.
- Customer profile page (previously an empty stub), a dashboard with the current pack and days left, printable invoices, and ticket tracking with admin replies.
- Admin dashboard statistics, customer search and filters, CSV export of the billing report, and a feedback list.
- Tests: 41 pytest (run on SQLite and MySQL), 20 Vitest, and 4 Playwright end-to-end journeys.
- Docker Compose with MySQL 8.4, the API and nginx. GitHub Actions CI including a Compose smoke test.
- README, DEVELOPMENT guide, CONTRIBUTING, MIT license and screenshots.

### Changed

- Restructured from `UI/air-fone`, `API/` and `DB/` into `web/`, `api/` and `docs/`. The original `Documents/` folder moved, unchanged, to `docs/project/`.
- Angular 10 (NgModules, Zone.js, Karma, Protractor, TSLint) → Angular 21 (standalone, signals, zoneless, Vitest, Playwright, Prettier).
- Hand-written SQL scripts → SQLAlchemy 2 models and Alembic migrations. Customer IDs are now separate from mobile numbers.
- Tickets are assigned to the least-busy agent instead of a random name.
- Routes are lowercase, such as `/plans/prepaid` and `/admin/tickets`. The mapping from the old routes is in `web/src/app/app.routes.ts`.

### Removed

- `DB/*.sql` seed scripts containing real people's personal data, and API files with hard-coded credentials.
- Storage of plain-text passwords, full card numbers, CVVs and full Aadhaar numbers.

### Security

- Fixed SQL injection throughout the original APIs (queries were built by string concatenation).
- Fixed an unauthenticated endpoint that returned every admin's username and password.
- Fixed "forgot password" e-mailing the plain-text password.
- **Commits before 2.0.0 still contain e-mail account passwords, an SMS API key and personal data in their history.** Treat those credentials as compromised.

## [1.0.0] - 2020-08-19

Final Team-4 submission: an Angular 10 customer portal and admin console, Flask customer and admin APIs, MySQL scripts, and project documentation (BRS, module list, test cases, demo video).

[2.0.0]: https://github.com/imkarthiknr/AirFone/compare/9ef4fa8...master
[1.0.0]: https://github.com/imkarthiknr/AirFone/commit/9ef4fa8
