import { test as base } from '@playwright/test'
import { mockAccountDetail, mockAccounts, mockLogin, mockRecharge, mockRegister, mockTransfer } from '../mocks/handlers'
import type { MockAccount, MockMovement } from '../mocks/payloads'

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
  accountDetail: {
    found: (account: MockAccount) => Promise<void>
    notFound: (accountId: string) => Promise<void>
    movements: (accountId: string, items: readonly MockMovement[]) => Promise<void>
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
      accountDetail: {
        found: (account) => mockAccountDetail.found(page, account),
        notFound: (accountId) => mockAccountDetail.notFound(page, accountId),
        movements: (accountId, items) => mockAccountDetail.movements(page, accountId, items),
      },
      transfer: {
        insufficientFunds: () => mockTransfer.insufficientFunds(page),
      },
    })
  },
})
