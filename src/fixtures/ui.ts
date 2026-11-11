import { test as base } from '@playwright/test'
import { LoginActions, LoginLocators } from '../pages/login'

export type UiFixtures = {
  loginUi: LoginLocators
  login: LoginActions
}

// Fixtures de UI: Locators y Actions de cada pantalla, conectados entre sí.
export const test = base.extend<UiFixtures>({
  loginUi: async ({ page }, use) => {
    await use(new LoginLocators(page))
  },
  login: async ({ page, loginUi }, use) => {
    await use(new LoginActions(page, loginUi))
  },
})
