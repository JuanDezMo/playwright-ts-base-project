import { test as base } from '@playwright/test'
import { mockLogin } from '../mocks/handlers'

// Handlers de mocks ya ligados a la página de la prueba: mockApi.login.invalidCredentials()
type MockApi = {
  login: { invalidCredentials: () => Promise<void> }
}

export type MockFixtures = { mockApi: MockApi }

export const test = base.extend<MockFixtures>({
  mockApi: async ({ page }, use) => {
    await use({
      login: { invalidCredentials: () => mockLogin.invalidCredentials(page) },
    })
  },
})
