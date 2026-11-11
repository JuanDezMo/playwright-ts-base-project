# Playwright Banking Lab

Automated tests with [Playwright](https://playwright.dev) for **Banking Test Lab**: the React web app in `../banking_frontend_lab` and the Go API in `../accounts_api/go_accounts_api`. It is a learning project: the same scenarios are tested at different levels (API, UI with a mocked API, UI end to end) to compare them.

## Documentation

| Document | Content |
| --- | --- |
| [docs/playwright-plan.md](docs/playwright-plan.md) | Architecture: layers, responsibilities, fixtures, mocks, SOLID, test organization |
| [docs/playwright-iterations.md](docs/playwright-iterations.md) | Iteration plan with measurable tasks |
| [docs/minimum-tests.md](docs/minimum-tests.md) | Minimum proposed component and e2e tests |
| [docs/comparisons.md](docs/comparisons.md) | Comparison template between test levels (filled in iterations 2 to 4) |

## Status

| Iteration | Status |
| --- | --- |
| 0 · Base project | ✅ Done: structure, config, smoke test `SMOKE-01` |
| 1 · First API component test (API-AUTH-01) | ✅ Done: `ApiClient`, `AuthApi`, `authApi` fixture, `uniqueEmail()` |
| 2 · First UI component test (C-03) | ✅ Done: login Locators/Actions, `page.route` mock, comparison 1 |
| 3 · Successful login: API and e2e | Next |

## Requirements

- Node.js 22+
- pnpm
- The Go API running on `http://localhost:3000` (with PostgreSQL and the operator seed)
- The web app running on `http://localhost:5173` (needed from iteration 2, for UI tests)

## Getting started

```bash
pnpm install
pnpm exec playwright install chromium   # browser for UI tests

# Start the API (../accounts_api/go_accounts_api) and, for UI tests, the web app:
#   cd ../banking_frontend_lab && pnpm dev

pnpm test
```

Default URLs and the operator credentials live in `src/config/env.ts`. To override them, copy `.env.example` to `.env`.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm test` | Run every project |
| `pnpm test:api` | API component tests (no browser) |
| `pnpm test:ui:component` | UI component tests (needs the web app, not the API) |
| `pnpm typecheck` | TypeScript check |
| `pnpm report` | Open the last HTML report |

More scripts are added per iteration (`test:ui:component`, `test:ui:e2e`, `test:smoke`, `gen:mocks`...).

## Structure

```
playwright_base_project/
├─ playwright.config.ts     # one project per test type (api-component, ui-component)
├─ src/
│  ├─ config/env.ts         # URLs and seed credentials
│  ├─ api/                  # API clients: ApiClient, AuthApi
│  ├─ pages/                # Locators + Actions per screen (login)
│  ├─ mocks/                # page.route handlers
│  ├─ fixtures/             # dependency injection: import { test, expect } from '@/fixtures'
│  └─ data/                 # unique test data factories
├─ tests/
│  ├─ setup/                # session per role (storageState, iteration 3)
│  ├─ ui/component/         # screen + mocked API
│  ├─ ui/e2e/               # browser + real API
│  ├─ api/component/        # one endpoint
│  └─ api/e2e/              # business flow across endpoints
└─ docs/
```

Layer rule: `tests → fixtures → pages (Actions → Locators) / api / mocks → config`. Tests describe the scenario and assert; fixtures build and inject everything else. See [docs/playwright-plan.md](docs/playwright-plan.md).

## Test users

| Role | Email | Password |
| --- | --- | --- |
| Operator | `operator@bank.local` | `Operator2026!` (API seed) |
| Customer | Created per test with a unique email | — |
