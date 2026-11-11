import type { Page } from '@playwright/test'

// Detalle de una cuenta: solo navegación (lo demás son aserciones sobre los Locators)
export class AccountDetailActions {
  constructor(private readonly page: Page) {}

  async goto(accountId: string, pageNumber?: string): Promise<void> {
    await this.page.goto(`/accounts/${accountId}${pageNumber ? `?page=${pageNumber}` : ''}`)
  }
}
