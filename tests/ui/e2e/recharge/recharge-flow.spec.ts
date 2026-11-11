import { jsonOf } from '@/api/json'
import type { Account } from '@/data/domain'
import { expect, test } from '@/fixtures'

test.describe('Recharge flow (real API)', () => {
  test('E2E-02 the operator recharges and the customer sees the money', async ({
    asOperator,
    customerAccountsApi,
    operator,
    operatorUi,
    customerBrowser,
  }) => {
    void asOperator
    // Preparar por API: el cliente (creado por la fixture) abre una cuenta de ahorros
    const { accountNumber } = await jsonOf<Account>(
      await customerAccountsApi.create('savings'),
      201,
      'setup: create savings account',
    )

    // Operador (página principal, sesión guardada): recarga por la UI
    await operator.goto()
    await operator.recharge(accountNumber, 'salary', '1500')
    await expect(operatorUi.receiptAmount).toHaveText('$1,500.00')

    // Cliente (otro contexto de navegador, al mismo tiempo): ve el dinero
    await customerBrowser.dashboard.goto()
    await expect(customerBrowser.dashboardUi.selectedBalance).toHaveAttribute('value', '150000')
    await expect(customerBrowser.dashboardUi.recentMovements).toContainText('Salary')
  })
})
