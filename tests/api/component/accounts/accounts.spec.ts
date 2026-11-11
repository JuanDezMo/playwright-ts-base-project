import { jsonOf } from '@/api/json'
import type { Account } from '@/data/domain'
import { expect, test } from '@/fixtures'

test.describe('GET /accounts', () => {
  test('API-ACC-01 an operator cannot list accounts (403)', async ({ operatorAccountsApi }) => {
    const response = await operatorAccountsApi.list()

    expect(response.status()).toBe(403)
    expect(await response.json()).toEqual({ code: 'FORBIDDEN', message: 'Access denied' })
  })

  test('API-ACC-02 rejects a request without token with 401', async ({ apiClient }) => {
    const response = await apiClient.get('/accounts')

    expect(response.status()).toBe(401)
    expect(await response.json()).toEqual({ code: 'UNAUTHORIZED', message: 'Missing or invalid token' })
  })
})

test.describe('GET /accounts/{id}', () => {
  test('API-ACC-03 an account of another customer looks like it does not exist (404)', async ({
    customerAccountsApi,
    otherCustomerAccountsApi,
  }) => {
    const foreign = await jsonOf<Account>(await otherCustomerAccountsApi.create('savings'), 201, 'setup: foreign account')

    const response = await customerAccountsApi.getById(foreign.id)

    expect(response.status()).toBe(404)
    expect(await response.json()).toEqual({ code: 'NOT_FOUND', message: 'Account not found' })
  })

  test('API-ACC-04 an id that is not a UUID is rejected with 400', async ({ customerAccountsApi }) => {
    const response = await customerAccountsApi.getById('not-a-uuid')

    expect(response.status()).toBe(400)
    expect(await response.json()).toEqual({ code: 'BAD_REQUEST', message: 'Invalid account id' })
  })
})

test.describe('GET /accounts/{id}/movements', () => {
  test('API-ACC-05 rejects page 0 with 400', async ({ customerAccountsApi }) => {
    const account = await jsonOf<Account>(await customerAccountsApi.create('savings'), 201, 'setup: account')

    const response = await customerAccountsApi.movements(account.id, 0)

    expect(response.status()).toBe(400)
    expect(await response.json()).toEqual({ code: 'BAD_REQUEST', message: 'Invalid pagination' })
  })
})
