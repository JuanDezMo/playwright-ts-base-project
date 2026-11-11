import { test as base } from '@playwright/test'
import { AccountDetailActions, AccountDetailLocators } from '../pages/account-detail'
import { DashboardActions, DashboardLocators } from '../pages/dashboard'
import { LoginActions, LoginLocators } from '../pages/login'
import { OperatorActions, OperatorLocators } from '../pages/operator'
import { RegisterActions, RegisterLocators } from '../pages/register'
import { TransferActions, TransferLocators } from '../pages/transfer'

export type UiFixtures = {
  loginUi: LoginLocators
  login: LoginActions
  operatorUi: OperatorLocators
  operator: OperatorActions
  registerUi: RegisterLocators
  register: RegisterActions
  dashboardUi: DashboardLocators
  dashboard: DashboardActions
  transferUi: TransferLocators
  transfer: TransferActions
  accountDetailUi: AccountDetailLocators
  accountDetail: AccountDetailActions
}

// Fixtures de UI: Locators y Actions de cada pantalla, conectados entre sí.
export const test = base.extend<UiFixtures>({
  loginUi: async ({ page }, use) => {
    await use(new LoginLocators(page))
  },
  login: async ({ page, loginUi }, use) => {
    await use(new LoginActions(page, loginUi))
  },
  operatorUi: async ({ page }, use) => {
    await use(new OperatorLocators(page))
  },
  operator: async ({ page, operatorUi }, use) => {
    await use(new OperatorActions(page, operatorUi))
  },
  registerUi: async ({ page }, use) => {
    await use(new RegisterLocators(page))
  },
  register: async ({ page, registerUi }, use) => {
    await use(new RegisterActions(page, registerUi))
  },
  dashboardUi: async ({ page }, use) => {
    await use(new DashboardLocators(page))
  },
  dashboard: async ({ page, dashboardUi }, use) => {
    await use(new DashboardActions(page, dashboardUi))
  },
  transferUi: async ({ page }, use) => {
    await use(new TransferLocators(page))
  },
  transfer: async ({ page, transferUi }, use) => {
    await use(new TransferActions(page, transferUi))
  },
  accountDetailUi: async ({ page }, use) => {
    await use(new AccountDetailLocators(page))
  },
  accountDetail: async ({ page }, use) => {
    await use(new AccountDetailActions(page))
  },
})
