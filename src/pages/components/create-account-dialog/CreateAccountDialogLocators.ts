import type { Locator, Page } from '@playwright/test'
import type { AccountType } from '@/api/AccountsApi'

// Diálogo "Open an account": lo usan el dashboard vacío, la acción "Add account" y la lista
export class CreateAccountDialogLocators {
  readonly dialog: Locator
  readonly submitButton: Locator
  readonly errorAlert: Locator

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Open an account' })
    this.submitButton = this.dialog.getByRole('button', { name: 'Open account' })
    this.errorAlert = this.dialog.getByTestId('create-account-error-alert')
  }

  // Opción del tipo de cuenta (radio dentro de una tarjeta)
  option(type: AccountType): Locator {
    return this.dialog.getByRole('radio', { name: type === 'savings' ? /Savings/ : /Checking/ })
  }
}
