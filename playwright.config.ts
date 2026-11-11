import { defineConfig } from '@playwright/test'
import { env } from './src/config/env'

// Un proyecto por tipo de prueba (ver docs/playwright-plan.md, sección 6).
// Iteración 0: solo api-component. Los demás proyectos se agregan en sus iteraciones.
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
  ],
})
