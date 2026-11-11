import { defineConfig, devices } from '@playwright/test'
import { env } from './src/config/env'

// Un proyecto por tipo de prueba (ver docs/playwright-plan.md, sección 6).
// Los demás proyectos (ui-e2e, api-e2e, móvil) se agregan en sus iteraciones.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'api-component',
      testDir: './tests/api/component',
      use: { baseURL: env.apiUrl },
    },
    {
      // Pantalla + API simulada: necesita el frontend, no la API
      name: 'ui-component',
      testDir: './tests/ui/component',
      use: { ...devices['Desktop Chrome'], baseURL: env.baseUrl },
    },
  ],
})
