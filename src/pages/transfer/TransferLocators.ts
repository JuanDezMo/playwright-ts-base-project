import type { Locator, Page } from '@playwright/test'
import { ConfirmTransferDialogLocators } from '../components/confirm-transfer-dialog'

// Pantalla de transferencia (/transfer)
export class TransferLocators {
  readonly form: Locator
  readonly destination: Locator
  readonly amount: Locator
  readonly reviewButton: Locator
  readonly destinationError: Locator
  readonly amountError: Locator
  readonly confirmDialog: ConfirmTransferDialogLocators
  readonly toast: Locator

  constructor(private readonly page: Page) {
    this.form = page.getByTestId('transfer-form')
    this.destination = this.form.getByLabel('To account number')
    this.amount = this.form.getByLabel('Amount')
    this.reviewButton = this.form.getByRole('button', { name: 'Review transfer' })
    this.destinationError = page.locator('#transfer-destination-error')
    this.amountError = page.locator('#transfer-amount-error')
    this.confirmDialog = new ConfirmTransferDialogLocators(page)
    this.toast = page.locator('[data-sonner-toast]')
  }

  // Botón rápido para usar otra cuenta propia como destino
  destinationChip(accountNumber: string): Locator {
    return this.page.getByTestId(`destination-chip-${accountNumber}`)
  }
}
