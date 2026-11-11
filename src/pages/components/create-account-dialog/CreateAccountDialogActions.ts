import type { AccountType } from '@/data/domain'
import type { CreateAccountDialogLocators } from './CreateAccountDialogLocators'

export class CreateAccountDialogActions {
  constructor(private readonly ui: CreateAccountDialogLocators) {}

  // Elige el tipo y confirma (el diálogo ya debe estar abierto)
  async create(type: AccountType): Promise<void> {
    await this.ui.option(type).check()
    await this.ui.submitButton.click()
  }
}
