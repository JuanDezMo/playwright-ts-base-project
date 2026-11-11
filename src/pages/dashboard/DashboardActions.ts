import type { Page } from '@playwright/test'
import type { AccountType } from '@/data/domain'
import { CreateAccountDialogActions } from '../components/create-account-dialog'
import type { DashboardLocators } from './DashboardLocators'

// Cómo se opera el dashboard del cliente
export class DashboardActions {
  private readonly dialog: CreateAccountDialogActions

  constructor(
    private readonly page: Page,
    private readonly ui: DashboardLocators,
  ) {
    this.dialog = new CreateAccountDialogActions(ui.createAccountDialog)
  }

  async goto(): Promise<void> {
    await this.page.goto('/accounts')
  }

  // Abre la primera cuenta desde el estado vacío
  async openFirstAccount(type: AccountType): Promise<void> {
    await this.ui.firstAccountButton.click()
    await this.dialog.create(type)
  }
}
