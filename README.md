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
| 3 · Successful login: API and e2e | ✅ Done: API-AUTH-02, E2E-00, health checks, saved operator session, comparison 2 |
| 4 · Login lockout: when to mock | ✅ Done: API-AUTH-03, C-04 with `page.clock`, comparison 3 |
| 5 · Register | ✅ Done: register Locators/Actions, C-01, C-02, API-REG-01, API-REG-02 |
| 6 · Accounts | ✅ Done: AccountsApi, dashboard and dialog page objects, actor fixtures, E2E-01, API-ACC-01 |
| 7 · Recharge | ✅ Done: OperatorApi, operator page objects, fake session, C-07, C-08, E2E-02 (two browser contexts), API-RCH-01 |
| 8 · Transfer | ✅ Done: TransfersApi, transfer/dialog/detail page objects, `customerWithFunds`, C-05, C-06, E2E-03, API-TRF-01 |
| 9 · Mocks from OpenAPI | ✅ Done: `pnpm gen:mocks`, typed examples with `satisfies`, ESLint layer rules |
| 10 · API e2e, smoke and mobile | Next |

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

Before the tests, `api-health` and `web-health` check that the services are up and fail with a clear message if not. Default URLs and the operator credentials live in `src/config/env.ts`. To override them, copy `.env.example` to `.env`.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm test` | Run every project |
| `pnpm test:api` | API component tests (no browser) |
| `pnpm test:ui:component` | UI component tests (needs the web app, not the API) |
| `pnpm test:ui:e2e` | UI end-to-end tests (needs the web app and the API) |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint, including the layer dependency rules |
| `pnpm gen:mocks` | Regenerate `src/mocks/generated` and `src/mocks/api-types.ts` from `../accounts_api/openapi.yaml` (`OPENAPI_PATH` to override) |
| `pnpm report` | Open the last HTML report |

More scripts are added per iteration (`test:smoke`...).

## Structure

```
playwright_base_project/
├─ playwright.config.ts     # health checks + auth setup, then api-component, ui-component, ui-e2e
├─ src/
│  ├─ config/               # env.ts (URLs, seed credentials), sessions.ts (saved session files)
│  ├─ api/                  # API clients: Auth, Accounts, Operator, Transfers (+ ApiClient, jwt)
│  ├─ pages/                # Locators + Actions per screen and shared components (dialog)
│  ├─ mocks/                # page.route handlers, payloads, generated/ examples and api-types.ts (from OpenAPI)
│  ├─ fixtures/             # api, ui, mocks, session → base → actors (customer, operator)
│  └─ data/                 # factories, fake sessions, shared domain types
├─ scripts/gen-mocks.ts     # OpenAPI examples → src/mocks/generated
├─ tests/
│  ├─ setup/                # API/web health checks and saved session per role
│  ├─ ui/component/         # screen + mocked API
│  ├─ ui/e2e/               # browser + real API
│  ├─ api/component/        # one endpoint
│  └─ api/e2e/              # business flow across endpoints
└─ docs/
```

Layer rule: `tests → fixtures → pages (Actions → Locators) / api / mocks → config / data`, enforced by `pnpm lint`. Tests describe the scenario and assert; fixtures build and inject everything else. See [docs/playwright-plan.md](docs/playwright-plan.md).

## Test users

| Role | Email | Password |
| --- | --- | --- |
| Operator | `operator@bank.local` | `Operator2026!` (API seed) |
| Customer | Created per test with a unique email | — |
