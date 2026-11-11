import { test as base } from '@playwright/test'
import { mockAccounts, mockLogin, mockRecharge, mockRegister, mockTransfer } from '../mocks/handlers'
import type { MockAccount } from '../mocks/payloads'

// Handlers de mocks ya ligados a la página de la prueba: mockApi.login.tooManyRequests(75)
type MockApi = {
  login: {
    invalidCredentials: () => Promise<void>
    tooManyRequests: (retryAfterSeconds: number) => Promise<void>
  }
  register: {
    emailAlreadyRegistered: () => Promise<void>
  }
  recharge: {
    success: (amountCents: number) => Promise<void>
  }
  accounts: {
    list: (items: readonly MockAccount[]) => Promise<void>
  }
  transfer: {
    insufficientFunds: () => Promise<void>
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
      register: {
        emailAlreadyRegistered: () => mockRegister.emailAlreadyRegistered(page),
      },
      recharge: {
        success: (amountCents) => mockRecharge.success(page, amountCents),
      },
      accounts: {
        list: (items) => mockAccounts.list(page, items),
      },
      transfer: {
        insufficientFunds: () => mockTransfer.insufficientFunds(page),
      },
    })
  },
})
