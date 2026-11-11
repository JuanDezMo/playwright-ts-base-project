import { defineConfig, devices } from '@playwright/test'
import { env } from './src/config/env'

// Un proyecto por tipo de prueba (ver docs/playwright-plan.md, sección 6).
// Los proyectos *-health y auth-setup se ejecutan antes, como dependencias:
// cada tipo de prueba solo exige los servicios que realmente usa.
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
    // Verificaciones previas y sesiones
    { name: 'api-health', testDir: './tests/setup', testMatch: /api\.health\.setup\.ts/ },
    { name: 'web-health', testDir: './tests/setup', testMatch: /web\.health\.setup\.ts/ },
    {
      name: 'auth-setup',
      testDir: './tests/setup',
      testMatch: /\.auth\.setup\.ts/,
      dependencies: ['api-health', 'web-health'],
      use: { ...devices['Desktop Chrome'], baseURL: env.baseUrl },
    },

    // Pruebas
    {
      // Un endpoint, sin navegador: necesita la API
      name: 'api-component',
      testDir: './tests/api/component',
      dependencies: ['api-health'],
      use: { baseURL: env.apiUrl },
    },
    {
      // Pantalla + API simulada: necesita el frontend, no la API
      name: 'ui-component',
      testDir: './tests/ui/component',
      dependencies: ['web-health'],
      use: { ...devices['Desktop Chrome'], baseURL: env.baseUrl },
    },
    {
      // Navegador + API real: necesita ambos y las sesiones guardadas
      name: 'ui-e2e',
      testDir: './tests/ui/e2e',
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], baseURL: env.baseUrl },
    },
  ],
})
