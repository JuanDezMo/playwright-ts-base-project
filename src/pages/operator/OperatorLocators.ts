import type { Locator, Page } from '@playwright/test'

// Pantalla de operaciones del operador (/operator)
export class OperatorLocators {
  readonly heading: Locator

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { name: 'Operations', level: 1 })
  }
}
