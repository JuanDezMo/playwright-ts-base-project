import js from '@eslint/js'
import tseslint from 'typescript-eslint'

// Reglas de dependencia entre capas (docs/playwright-plan.md, sección 3):
//   tests → fixtures → pages (Actions → Locators) / api / mocks → config / data
// Se prohíben los imports que romperían esa dirección.
const api = ['@/api/*', '**/api/*']
const pages = ['@/pages/*', '**/pages/*']
const mocks = ['@/mocks/*', '**/mocks/*']
const fixtures = ['@/fixtures', '@/fixtures/*', '**/fixtures/*']

const forbid = (groups, message) => ({
  'no-restricted-imports': ['error', { patterns: [{ group: groups.flat(), message }] }],
})

export default tseslint.config(
  { ignores: ['node_modules', 'playwright-report', 'test-results', 'src/mocks/generated', 'src/mocks/api-types.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/pages/**/*.ts'],
    rules: forbid([api, mocks, fixtures], 'Page Objects only use Playwright and their Locators: no API clients, mocks or fixtures.'),
  },
  {
    files: ['src/api/**/*.ts'],
    rules: forbid([pages, mocks, fixtures], 'API clients only talk to the API: no Page Objects, mocks or fixtures.'),
  },
  {
    files: ['src/mocks/**/*.ts'],
    rules: forbid([api, pages, fixtures], 'Mocks replace the API: no API clients, Page Objects or fixtures.'),
  },
  {
    files: ['tests/ui/component/**/*.ts'],
    rules: forbid([api, pages], 'UI component tests use a mocked API and get Page Objects from fixtures.'),
  },
  {
    files: ['tests/api/**/*.ts'],
    rules: forbid([pages, mocks], 'API tests never open a browser: no Page Objects or mocks.'),
  },
)
