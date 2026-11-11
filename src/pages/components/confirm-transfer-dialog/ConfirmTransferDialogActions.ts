import type { ConfirmTransferDialogLocators } from './ConfirmTransferDialogLocators'

export class ConfirmTransferDialogActions {
  constructor(private readonly ui: ConfirmTransferDialogLocators) {}

  async confirm(): Promise<void> {
    await this.ui.confirmButton.click()
  }
}
