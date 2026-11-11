import type { Locator, Page } from '@playwright/test'

type MovementType = 'recharge' | 'transfer_in' | 'transfer_out'

// Detalle de una cuenta (/accounts/:id) con su historial
export class AccountDetailLocators {
  readonly balance: Locator
  readonly movementsSection: Locator
  readonly movementsEmpty: Locator
  readonly movementsRange: Locator
  readonly notFound: Locator
  readonly invalidPageAlert: Locator
  readonly pagination: {
    current: Locator
    previous: Locator
    next: Locator
  }

  constructor(page: Page) {
    this.balance = page.getByTestId('account-detail-balance')
    this.movementsSection = page.getByTestId('movements-section')
    this.movementsEmpty = page.getByTestId('movements-empty')
    this.movementsRange = page.getByTestId('movements-range')
    this.notFound = page.getByTestId('account-not-found')
    this.invalidPageAlert = page.getByTestId('invalid-page-alert')
    this.pagination = {
      current: page.getByTestId('pagination-current'),
      previous: page.getByTestId('pagination-previous'),
      next: page.getByTestId('pagination-next'),
    }
  }

  // Movimientos de un tipo. La app muestra una tabla en escritorio y una lista en móvil
  // (la otra queda oculta con CSS): se filtran los visibles para que sirva en ambos.
  movementsOfType(type: MovementType): Locator {
    return this.movementsSection.locator(`[data-movement-type="${type}"]`).filter({ visible: true })
  }
}
