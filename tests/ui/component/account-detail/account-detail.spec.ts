import { expect, test } from '@/fixtures'
import { accounts, manyMovements, movements } from '@/mocks/payloads'

test.describe('Account detail screen', () => {
  // Sesión de cliente simulada: estas pruebas no necesitan la API
  test.beforeEach(async ({ asFakeCustomer, mockApi }) => {
    void asFakeCustomer
    await mockApi.accounts.list([accounts.savings, accounts.checking])
    await mockApi.accountDetail.found(accounts.savings)
  })

  test('C-09 shows the balance and the signed movements', async ({ mockApi, accountDetail, accountDetailUi }) => {
    await mockApi.accountDetail.movements(accounts.savings.id, [movements.transferOut, movements.recharge])
    await accountDetail.goto(accounts.savings.id)

    await expect(accountDetailUi.balance).toHaveText('$1,000.00')
    await expect(accountDetailUi.movementsOfType('recharge')).toContainText('Salary')
    await expect(accountDetailUi.movementsOfType('recharge')).toContainText('+$1,500.00')
    await expect(accountDetailUi.movementsOfType('transfer_out')).toContainText('-$250.00')
    // La contraparte es una cuenta propia: se muestra su número
    await expect(accountDetailUi.movementsOfType('transfer_out')).toContainText('To 0012 345 679')
    await expect(accountDetailUi.movementsRange).toHaveText('Showing 1–2')
  })

  test('C-10 shows the empty state when there are no movements', async ({ mockApi, accountDetail, accountDetailUi }) => {
    await mockApi.accountDetail.movements(accounts.savings.id, [])
    await accountDetail.goto(accounts.savings.id)

    await expect(accountDetailUi.movementsEmpty).toContainText('No movements yet')
    await expect(accountDetailUi.pagination.next).toBeHidden()
  })

  test('C-11 paginates the history 20 at a time', async ({ mockApi, accountDetail, accountDetailUi }) => {
    // 21 movimientos: la página 1 llega completa (hay siguiente) y la 2 trae solo uno
    await mockApi.accountDetail.movements(accounts.savings.id, manyMovements(21))
    await accountDetail.goto(accounts.savings.id)

    await expect(accountDetailUi.movementsRange).toHaveText('Showing 1–20')
    await expect(accountDetailUi.pagination.previous).toBeDisabled()

    await accountDetailUi.pagination.next.click()

    await expect(accountDetailUi.pagination.current).toHaveText('Page 2')
    await expect(accountDetailUi.movementsRange).toHaveText('Showing 21–21')
    await expect(accountDetailUi.pagination.next).toBeDisabled()
  })

  test('C-12 rejects an invalid page number in the address', async ({ mockApi, accountDetail, accountDetailUi }) => {
    await mockApi.accountDetail.movements(accounts.savings.id, [movements.recharge])
    await accountDetail.goto(accounts.savings.id, 'abc')

    await expect(accountDetailUi.invalidPageAlert).toContainText('The page number in the address is not valid')
    await expect(accountDetailUi.movementsSection).toBeHidden()
  })

  test('C-13 shows "Account not found" when the account is missing or not yours', async ({
    mockApi,
    accountDetail,
    accountDetailUi,
    page,
  }) => {
    const missing = '00000000-0000-4000-8000-0000000000ff'
    await mockApi.accountDetail.notFound(missing)
    await accountDetail.goto(missing)

    await expect(accountDetailUi.notFound).toContainText('Account not found')
    await expect(page.getByRole('link', { name: 'Go to your accounts' })).toBeVisible()
  })
})
