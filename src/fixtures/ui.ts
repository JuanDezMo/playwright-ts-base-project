import { test as base } from '@playwright/test'
import { LoginActions, LoginLocators } from '../pages/login'
import { OperatorLocators } from '../pages/operator'

export type UiFixtures = {
  loginUi: LoginLocators
  login: LoginActions
  operatorUi: OperatorLocators
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
})
