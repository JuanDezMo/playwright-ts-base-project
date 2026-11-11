import { test as base } from '@playwright/test'
import { mockLogin } from '../mocks/handlers'

// Handlers de mocks ya ligados a la página de la prueba: mockApi.login.tooManyRequests(75)
type MockApi = {
  login: {
    invalidCredentials: () => Promise<void>
    tooManyRequests: (retryAfterSeconds: number) => Promise<void>
  }
}

export type MockFixtures = { mockApi: MockApi }

export const test = base.extend<MockFixtures>({
  mockApi: async ({ page }, use) => {
    await use({
      login: {
        invalidCredentials: () => mockLogin.invalidCredentials(page),
        tooManyRequests: (seconds) => mockLogin.tooManyRequests(page, seconds),
      },
    })
  },
})
