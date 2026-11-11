import type { Page } from '@playwright/test'
import type { MockAccount } from './payloads'

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

  // 429 con Retry-After: el frontend lo usa para la cuenta regresiva
  tooManyRequests: async (page: Page, retryAfterSeconds: number): Promise<void> => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 429,
        headers: { 'Retry-After': String(retryAfterSeconds) },
        json: { code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts' },
      }),
    )
  },
}

export const mockRegister = {
  emailAlreadyRegistered: async (page: Page): Promise<void> => {
    await page.route('**/api/auth/register', (route) =>
      route.fulfill({
        status: 409,
        json: { code: 'EMAIL_ALREADY_REGISTERED', message: 'Email already registered' },
      }),
    )
  },
}

export const mockRecharge = {
  // 201 con el movimiento creado (mismo formato que F-08)
  success: async (page: Page, amountCents: number): Promise<void> => {
    await page.route('**/api/recharge', (route) =>
      route.fulfill({
        status: 201,
        json: {
          id: 'a41e0000-0000-4000-8000-000000000001',
          accountId: '6f1c0000-0000-4000-8000-000000000001',
          movementType: 'recharge',
          amount: amountCents,
          details: { rechargeType: 'salary' },
          createdAt: '2026-11-10T14:30:00.000Z',
        },
      }),
    )
  },
}

export const mockAccounts = {
  // GET /accounts con la lista indicada (solo el listado; no intercepta /accounts/:id)
  list: async (page: Page, items: readonly MockAccount[]): Promise<void> => {
    await page.route('**/api/accounts', (route) =>
      route.request().method() === 'GET' ? route.fulfill({ json: { items } }) : route.fallback(),
    )
  },
}

export const mockTransfer = {
  insufficientFunds: async (page: Page): Promise<void> => {
    await page.route('**/api/transfers', (route) =>
      route.fulfill({ status: 422, json: { code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds' } }),
    )
  },
}
