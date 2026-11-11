import type { Page } from '@playwright/test'
import { ConfirmTransferDialogActions } from '../components/confirm-transfer-dialog'
import type { TransferLocators } from './TransferLocators'

// Cómo se opera la transferencia: revisar (abre el diálogo) y confirmar son pasos separados
export class TransferActions {
  private readonly dialog: ConfirmTransferDialogActions

  constructor(
    private readonly page: Page,
    private readonly ui: TransferLocators,
  ) {
    this.dialog = new ConfirmTransferDialogActions(ui.confirmDialog)
  }

  async goto(): Promise<void> {
    await this.page.goto('/transfer')
  }

  // Escribe el destino y el monto y pulsa "Review transfer"
  async review(destination: string, amount: string): Promise<void> {
    await this.ui.destination.fill(destination)
    await this.ui.amount.fill(amount)
    await this.ui.reviewButton.click()
  }

  // Igual que review, pero el destino se elige con el botón de una cuenta propia
  async reviewToOwnAccount(accountNumber: string, amount: string): Promise<void> {
    await this.ui.destinationChip(accountNumber).click()
    await this.ui.amount.fill(amount)
    await this.ui.reviewButton.click()
  }

  async confirm(): Promise<void> {
    await this.dialog.confirm()
  }
}
