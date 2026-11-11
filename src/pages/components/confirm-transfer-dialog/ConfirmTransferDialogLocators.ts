import type { Locator, Page } from '@playwright/test'

// Diálogo de revisión de la transferencia ("Review transfer")
export class ConfirmTransferDialogLocators {
  readonly dialog: Locator
  readonly summaryAmount: Locator
  readonly summaryDestination: Locator
  readonly confirmButton: Locator
  readonly retryButton: Locator
  readonly errorAlert: Locator

  constructor(page: Page) {
    this.dialog = page.getByTestId('confirm-transfer-dialog')
    this.summaryAmount = this.dialog.getByTestId('summary-amount')
    this.summaryDestination = this.dialog.getByTestId('summary-destination')
    this.confirmButton = this.dialog.getByRole('button', { name: 'Confirm transfer' })
    // Tras un error el mismo botón cambia su texto a "Try again"
    this.retryButton = this.dialog.getByRole('button', { name: 'Try again' })
    this.errorAlert = this.dialog.getByTestId('transfer-error-alert')
  }
}
