import { expect, test } from '@/fixtures'

test.describe('POST /recharge', () => {
  test('API-RCH-01 rejects a cash recharge above $3,000.00 with 422', async ({ customerAccountsApi, operatorApi }) => {
    const created = await customerAccountsApi.create('savings')
    expect(created.status(), 'setup: create savings account').toBe(201)
    const { accountNumber } = (await created.json()) as { accountNumber: string }

    // 300001 centavos = $3,000.01: un centavo sobre el tope de efectivo (RN-08)
    const response = await operatorApi.recharge(accountNumber, 300001, 'cash')

    expect(response.status()).toBe(422)
    expect(await response.json()).toEqual({
      code: 'CASH_LIMIT_EXCEEDED',
      message: 'Cash recharge limit exceeded',
    })
  })
})
