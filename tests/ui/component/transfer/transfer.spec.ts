import { expect, test } from '@/fixtures'
import { accounts } from '@/mocks/payloads'

test.describe('Transfer screen', () => {
  // Sesión de cliente simulada: estas pruebas no necesitan la API
  test.beforeEach(async ({ asFakeCustomer }) => {
    void asFakeCustomer
  })

  test('C-05 rejects the same account and an empty amount before reviewing', async ({ mockApi, transfer, transferUi }) => {
    await mockApi.accounts.list([accounts.savings])
    await transfer.goto()

    // Destino = la misma cuenta de origen y sin monto
    await transfer.review(accounts.savings.accountNumber, '')

    await expect(transferUi.destinationError).toHaveText('Cannot transfer to the same account')
    await expect(transferUi.amountError).toHaveText('Enter an amount')
    await expect(transferUi.confirmDialog.dialog).toBeHidden()
  })

  test('C-06 shows insufficient funds in the review dialog', async ({ mockApi, transfer, transferUi }) => {
    await mockApi.accounts.list([accounts.savings, accounts.checking])
    await mockApi.transfer.insufficientFunds()
    await transfer.goto()

    await transfer.reviewToOwnAccount(accounts.checking.accountNumber, '999999')
    await expect(transferUi.confirmDialog.summaryAmount).toHaveText('$999,999.00')
    await transfer.confirm()

    await expect(transferUi.confirmDialog.errorAlert).toContainText('Insufficient funds')
    await expect(transferUi.confirmDialog.retryButton).toBeVisible()
  })
})
