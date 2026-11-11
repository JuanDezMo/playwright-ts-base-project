import { expect, test } from '@/fixtures'

test.describe('Accounts dashboard (real API)', () => {
  test('E2E-01 a new customer opens a savings account', async ({ customerSession, customerAccountsApi, dashboard, dashboardUi }) => {
    void customerSession // cliente nuevo, registrado por API y con sesión iniciada por la UI

    // Sin cuentas: estado vacío
    await expect(dashboardUi.emptyState).toBeVisible()

    await dashboard.openFirstAccount('savings')

    await expect(dashboardUi.toast).toContainText('Savings account opened')
    // <data value="0">: el saldo exacto en centavos está en el atributo value
    await expect(dashboardUi.selectedBalance).toHaveAttribute('value', '0')
    await expect(dashboardUi.selectedBalance).toHaveText('$0.00')
    await expect(dashboardUi.selectedNumber).toHaveText(/^\d{4} \d{3} \d{3}$/)
    await expect(dashboardUi.recentMovementsEmpty).toContainText('No movements yet')

    // Confirmar con la API que la cuenta existe en el backend y coincide con la pantalla
    const response = await customerAccountsApi.list()
    const { items } = (await response.json()) as { items: { accountNumber: string; accountType: string; balance: number }[] }
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ accountType: 'savings', balance: 0 })
    const shownNumber = (await dashboardUi.selectedNumber.textContent())?.replace(/\s/g, '')
    expect(items[0]?.accountNumber).toBe(shownNumber)
  })
})
