import type { Locator, Page } from '@playwright/test'
import type { RechargeType } from '@/api/OperatorApi'

const rechargeTypeNames: Record<RechargeType, RegExp> = {
  cash: /Cash/,
  salary: /Salary/,
  employer_bonus: /Employer bonus/,
}

// Pantalla de operaciones del operador (/operator): recarga y búsqueda de cuenta
export class OperatorLocators {
  readonly heading: Locator
  // Formulario de recarga
  readonly rechargeForm: Locator
  readonly accountNumber: Locator
  readonly amount: Locator
  readonly submitButton: Locator
  readonly errorAlert: Locator
  // Comprobante
  readonly receipt: Locator
  readonly receiptAmount: Locator
  readonly receiptViewAccountLink: Locator

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { name: 'Operations', level: 1 })
    this.rechargeForm = page.getByTestId('recharge-form')
    this.accountNumber = this.rechargeForm.getByLabel('Account number')
    this.amount = this.rechargeForm.getByLabel('Amount')
    this.submitButton = this.rechargeForm.getByRole('button', { name: 'Recharge account' })
    this.errorAlert = page.getByTestId('recharge-error-alert')
    this.receipt = page.getByTestId('recharge-receipt')
    this.receiptAmount = this.receipt.getByTestId('receipt-amount')
    this.receiptViewAccountLink = this.receipt.getByRole('link', { name: 'View account' })
  }

  rechargeType(type: RechargeType): Locator {
    return this.rechargeForm.getByRole('radio', { name: rechargeTypeNames[type] })
  }

  // Mensaje de validación dentro del formulario (bajo el campo correspondiente)
  validationMessage(text: string): Locator {
    return this.rechargeForm.getByText(text, { exact: true })
  }
}
