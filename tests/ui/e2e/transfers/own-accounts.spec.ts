import type { Account } from '@/data/domain'
import { expect, test } from '@/fixtures'

test.describe('Transfer flow (real API)', () => {
  test('E2E-03 transfers $250.00 between own accounts', async ({
    customerWithFunds,
    login,
    transfer,
    transferUi,
    accountDetailUi,
    customerAccountsApi,
  }) => {
    // Preparar: cliente con ahorros ($1,000.00) y corriente ($0.00), creado por API
    await login.loginAs(customerWithFunds, '/accounts')

    // Actuar: por defecto el origen es la primera cuenta (ahorros)
    await transfer.goto()
    await transfer.reviewToOwnAccount(customerWithFunds.checking.accountNumber, '250')
    await transfer.confirm()

    // Verificar en la UI: aviso y detalle de la cuenta de origen
    await expect(transferUi.toast).toContainText('Transfer of $250.00 completed')
    await expect(accountDetailUi.balance).toHaveAttribute('value', '75000')
    await expect(accountDetailUi.movementsOfType('transfer_out')).toHaveCount(1)
    await expect(accountDetailUi.movementsOfType('transfer_out')).toContainText('-$250.00')

    // Confirmar con la API el destino
    const response = await customerAccountsApi.getById(customerWithFunds.checking.id)
    expect(((await response.json()) as Account).balance).toBe(25000)
  })
})
