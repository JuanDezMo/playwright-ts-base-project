import type { Page } from '@playwright/test'

// Respuestas simuladas de la API con page.route (nativo de Playwright).
// El frontend llama a /api/* (su proxy hacia la API Go), por eso el patrón empieza con **/api.
// Iteración 9: estos cuerpos pasarán a generarse desde openapi.yaml.

export const mockLogin = {
  invalidCredentials: async (page: Page): Promise<void> => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 401,
        json: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      }),
    )
  },
}
