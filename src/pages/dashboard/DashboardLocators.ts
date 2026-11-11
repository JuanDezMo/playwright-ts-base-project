import type { Locator, Page } from '@playwright/test'
import { CreateAccountDialogLocators } from '../components/create-account-dialog'

// Dashboard del cliente (/accounts)
export class DashboardLocators {
  // Sin cuentas
  readonly emptyState: Locator
  readonly firstAccountButton: Locator
  // Cuenta seleccionada (bloque principal)
  readonly selectedBalance: Locator
  readonly selectedNumber: Locator
  readonly addAccountButton: Locator
  // Paneles
  readonly recentMovements: Locator
  readonly recentMovementsEmpty: Locator
  readonly accountList: Locator
  readonly openAccountButton: Locator
  // Diálogo compartido y aviso de éxito
  readonly createAccountDialog: CreateAccountDialogLocators
  readonly toast: Locator

  constructor(page: Page) {
    this.emptyState = page.getByTestId('accounts-empty')
    // Acotado al estado vacío: el diálogo tiene otro botón con el mismo nombre
    this.firstAccountButton = this.emptyState.getByRole('button', { name: 'Open account' })
    this.selectedBalance = page.getByTestId('selected-account-balance')
    this.selectedNumber = page.getByTestId('selected-account-number')
    this.addAccountButton = page.getByTestId('hero-add-account-button')
    this.recentMovements = page.getByTestId('recent-movements')
    this.recentMovementsEmpty = page.getByTestId('recent-movements-empty')
    this.accountList = page.getByTestId('account-list')
    this.openAccountButton = page.getByRole('button', { name: 'Open new account' })
    this.createAccountDialog = new CreateAccountDialogLocators(page)
    // Los toasts de sonner viven en una lista <ol> con aria-label "Notifications"
    this.toast = page.locator('[data-sonner-toast]')
  }

  // Fila de una cuenta en la lista "Accounts"
  accountRow(accountNumber: string): Locator {
    return this.accountList.getByTestId(`account-row-${accountNumber}`)
  }
}
