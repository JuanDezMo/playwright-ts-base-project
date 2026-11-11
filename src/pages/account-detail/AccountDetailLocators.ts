import type { Locator, Page } from '@playwright/test'

// Detalle de una cuenta (/accounts/:id) con su historial
export class AccountDetailLocators {
  readonly balance: Locator
  readonly movementsTable: Locator

  constructor(page: Page) {
    this.balance = page.getByTestId('account-detail-balance')
    this.movementsTable = page.getByTestId('movements-table')
  }

  // Filas del historial de un tipo (data-movement-type="transfer_out"...)
  movementsOfType(type: 'recharge' | 'transfer_in' | 'transfer_out'): Locator {
    return this.movementsTable.locator(`tbody tr[data-movement-type="${type}"]`)
  }
}
