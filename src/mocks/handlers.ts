import type { Page } from '@playwright/test'
import type { components } from './api-types'
import { examples, sharedExamples } from './generated'
import type { MockAccount, MockMovement } from './payloads'

// Respuestas simuladas de la API con page.route (nativo de Playwright).
// Los cuerpos salen de los ejemplos de openapi.yaml (pnpm gen:mocks) y se validan con
// `satisfies` contra los tipos del contrato: si el contrato cambia, esto deja de compilar.
// El frontend llama a /api/* (su proxy hacia la API Go), por eso el patrón empieza con **/api.

const MOVEMENTS_PAGE_SIZE = 20

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

export const mockAccountDetail = {
  // GET /accounts/:id con la cuenta indicada
  found: async (page: Page, account: MockAccount): Promise<void> => {
    await page.route(`**/api/accounts/${account.id}`, (route) => route.fulfill({ json: account }))
  },

  // GET /accounts/:id → 404 (no existe o es ajena)
  notFound: async (page: Page, accountId: string): Promise<void> => {
    await page.route(`**/api/accounts/${accountId}`, (route) =>
      route.fulfill({ status: 404, json: sharedExamples.AccountNotFound.example satisfies ApiError }),
    )
  },

  // GET /accounts/:id/movements?page=N: parte la lista en páginas de 20, como la API
  movements: async (page: Page, accountId: string, items: readonly MockMovement[]): Promise<void> => {
    await page.route(new RegExp(`/api/accounts/${accountId}/movements(\\?.*)?$`), (route) => {
      const number = Number(new URL(route.request().url()).searchParams.get('page') ?? '1')
      const start = (number - 1) * MOVEMENTS_PAGE_SIZE
      route.fulfill({ json: { page: number, pageSize: MOVEMENTS_PAGE_SIZE, items: items.slice(start, start + MOVEMENTS_PAGE_SIZE) } })
    })
  },
}

export const mockTransfer = {
  insufficientFunds: async (page: Page): Promise<void> => {
    await page.route('**/api/transfers', (route) =>
      route.fulfill({ status: 422, json: examples.transfer['422'].insufficientFunds satisfies ApiError }),
    )
  },
}
