import type { Page } from '@playwright/test'
import type { RechargeType } from '@/data/domain'
import type { OperatorLocators } from './OperatorLocators'

// Cómo se opera la pantalla del operador
export class OperatorActions {
  constructor(
    private readonly page: Page,
    private readonly ui: OperatorLocators,
  ) {}

  async goto(): Promise<void> {
    await this.page.goto('/operator')
  }

  // amount como lo escribe una persona: '1500' o '1,500.00'
  async recharge(accountNumber: string, type: RechargeType, amount: string): Promise<void> {
    await this.ui.accountNumber.fill(accountNumber)
    await this.ui.rechargeType(type).check()
    await this.ui.amount.fill(amount)
    await this.ui.submitButton.click()
  }

  async submitEmpty(): Promise<void> {
    await this.ui.submitButton.click()
  }
}
