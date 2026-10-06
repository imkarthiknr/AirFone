# Contributing

Thanks for your interest in AirFone!

## Reporting issues

Open an [issue](https://github.com/imkarthiknr/AirFone/issues) with the steps to reproduce, what you expected, and your OS, browser, Node and Python versions.

Please report security problems privately to the maintainer, not in a public issue.

## Making changes

1. Fork the repo and branch from `master`: `git checkout -b feat/short-description`.
2. Set up the project with [DEVELOPMENT.md](DEVELOPMENT.md).
3. Make your change **with tests**:
   - API behaviour: pytest in `api/tests/`
   - UI logic: Vitest specs next to the component
   - User journeys: Playwright in `web/e2e/`
4. If you changed a model, add an Alembic migration (`uv run alembic revision --autogenerate`).
5. Check everything locally:

   ```bash
   npm run lint
   npm test
   npm run e2e
   ```

6. Commit using [Conventional Commits](https://www.conventionalcommits.org/), e.g. `feat(api): add plan management`.
7. Open a pull request explaining **what** and **why**. Include screenshots for UI changes.

## Ground rules

- Never commit secrets, `.env` files or real personal data. Seed and test data must be fictional.
- Never store card numbers, CVVs or full identity numbers.
- Keep business rules in `api/app/services/`, not in route handlers or components.
