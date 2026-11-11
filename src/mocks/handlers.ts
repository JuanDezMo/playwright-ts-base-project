import type { Page } from '@playwright/test'
import type { components } from './api-types'
import { examples } from './generated'
import type { MockAccount } from './payloads'

// Respuestas simuladas de la API con page.route (nativo de Playwright).
// Los cuerpos salen de los ejemplos de openapi.yaml (pnpm gen:mocks) y se validan con
// `satisfies` contra los tipos del contrato: si el contrato cambia, esto deja de compilar.
// El frontend llama a /api/* (su proxy hacia la API Go), por eso el patrón empieza con **/api.

type ApiError = components['schemas']['Error']
type RechargeMovement = components['schemas']['RechargeMovement']

export const mockLogin = {
  invalidCredentials: async (page: Page): Promise<void> => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({ status: 401, json: examples.login['401'].example satisfies ApiError }),
    )
  },

  // 429 con Retry-After: el header no tiene valor de ejemplo en el contrato, se indica aquí
  tooManyRequests: async (page: Page, retryAfterSeconds: number): Promise<void> => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 429,
        headers: { 'Retry-After': String(retryAfterSeconds) },
        json: examples.login['429'].example satisfies ApiError,
      }),
    )
  },
}

export const mockRegister = {
  emailAlreadyRegistered: async (page: Page): Promise<void> => {
    await page.route('**/api/auth/register', (route) =>
      route.fulfill({ status: 409, json: examples.register['409'].example satisfies ApiError }),
    )
  },
}

export const mockRecharge = {
  // 201 con el movimiento del ejemplo, cambiando el monto por el que pide la prueba
  success: async (page: Page, amountCents: number): Promise<void> => {
    const movement = { ...examples.recharge['201'].schema, amount: amountCents } satisfies RechargeMovement
    await page.route('**/api/recharge', (route) => route.fulfill({ status: 201, json: movement }))
  },
}

export const mockAccounts = {
  // GET /accounts con la lista indicada (solo el listado; no intercepta /accounts/:id).
  // Datos escritos a mano en payloads.ts: deben ser coherentes entre llamadas.
  list: async (page: Page, items: readonly MockAccount[]): Promise<void> => {
    await page.route('**/api/accounts', (route) =>
      route.request().method() === 'GET' ? route.fulfill({ json: { items } }) : route.fallback(),
    )
  },
}

export const mockTransfer = {
  insufficientFunds: async (page: Page): Promise<void> => {
    await page.route('**/api/transfers', (route) =>
      route.fulfill({ status: 422, json: examples.transfer['422'].insufficientFunds satisfies ApiError }),
    )
  },
}
