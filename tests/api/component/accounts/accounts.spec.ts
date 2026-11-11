import { expect, test } from '@/fixtures'

test.describe('GET /accounts', () => {
  test('API-ACC-01 an operator cannot list accounts (403)', async ({ operatorAccountsApi }) => {
    const response = await operatorAccountsApi.list()

    expect(response.status()).toBe(403)
    expect(await response.json()).toEqual({ code: 'FORBIDDEN', message: 'Access denied' })
  })
})
