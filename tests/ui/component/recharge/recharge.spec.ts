import { expect, test } from '@/fixtures'

test.describe('Recharge screen', () => {
  // Sesión de operador simulada: estas pruebas no necesitan la API
  test.beforeEach(async ({ asFakeOperator, operator }) => {
    void asFakeOperator
    await operator.goto()
  })

  test('C-07 validates the empty recharge form', async ({ operator, operatorUi }) => {
    await operator.submitEmpty()

    await expect(operatorUi.validationMessage('Invalid account number')).toBeVisible()
    await expect(operatorUi.validationMessage('Choose a recharge type')).toBeVisible()
    await expect(operatorUi.validationMessage('Enter an amount')).toBeVisible()
  })

  test('C-08 shows the receipt after a successful recharge', async ({ mockApi, operator, operatorUi }) => {
    await mockApi.recharge.success(150000)

    await operator.recharge('0012345678', 'salary', '1500')

    await expect(operatorUi.receipt).toContainText('Recharge completed')
    await expect(operatorUi.receiptAmount).toHaveText('$1,500.00')
    await expect(operatorUi.receiptViewAccountLink).toBeVisible()
  })
})
