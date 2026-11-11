import { randomUUID } from 'node:crypto'
import { jsonOf } from '@/api/json'
import type { Account, TransferResult } from '@/data/domain'
import { expect, test } from '@/fixtures'

test.describe('POST /transfers', () => {
  test('API-TRF-01 a repeated Idempotency-Key replays the response without moving money twice', async ({
    customerWithFunds,
    customerTransfersApi,
    customerAccountsApi,
  }) => {
    const { savings, checking } = customerWithFunds
    const key = randomUUID()

    const first = await customerTransfersApi.create(savings.accountNumber, checking.accountNumber, 10000, key)
    const replay = await customerTransfersApi.create(savings.accountNumber, checking.accountNumber, 10000, key)

    expect(first.status()).toBe(201)
    expect(replay.status()).toBe(201)
    // Mismo cuerpo (mismos ids de movimiento) y marca de repetición
    expect((await replay.json()) as TransferResult).toEqual((await first.json()) as TransferResult)
    expect(replay.headers()['idempotent-replayed']).toBe('true')

    // El dinero se movió una sola vez: $1,000.00 - $100.00
    const origin = await customerAccountsApi.getById(savings.id)
    expect(((await origin.json()) as Account).balance).toBe(90000)
  })

  test('API-TRF-02 rejects a transfer to the same account with 400', async ({ customerWithFunds, customerTransfersApi }) => {
    const { savings } = customerWithFunds

    const response = await customerTransfersApi.create(savings.accountNumber, savings.accountNumber, 100)

    expect(response.status()).toBe(400)
    expect(await response.json()).toEqual({ code: 'BAD_REQUEST', message: 'Cannot transfer to the same account' })
  })

  test('API-TRF-03 rejects a transfer above the balance with 422 and moves no money', async ({
    customerWithFunds,
    customerTransfersApi,
    customerAccountsApi,
  }) => {
    const { savings, checking } = customerWithFunds

    // Ahorros tiene $1,000.00 y no admite sobregiro: $1,000.01 no alcanza
    const response = await customerTransfersApi.create(savings.accountNumber, checking.accountNumber, 100001)

    expect(response.status()).toBe(422)
    expect(await response.json()).toEqual({ code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds' })
    const origin = await customerAccountsApi.getById(savings.id)
    expect(((await origin.json()) as Account).balance).toBe(100000)
  })

  test('API-TRF-04 cannot use an account of another customer as the origin (404)', async ({
    customerWithFunds,
    otherCustomerAccountsApi,
    customerTransfersApi,
  }) => {
    // Cuenta ajena: no se revela que existe, se responde como inexistente (RN-23)
    const foreign = await jsonOf<Account>(await otherCustomerAccountsApi.create('savings'), 201, 'setup: foreign account')

    const response = await customerTransfersApi.create(foreign.accountNumber, customerWithFunds.checking.accountNumber, 100)

    expect(response.status()).toBe(404)
    expect(await response.json()).toEqual({ code: 'NOT_FOUND', message: 'Account not found' })
  })

  test('API-TRF-05 rejects a request without token with 401', async ({ apiClient }) => {
    const response = await apiClient.post(
      '/transfers',
      { accountOrigin: '0000000001', accountDestination: '0000000002', amount: 100 },
      { headers: { 'Idempotency-Key': randomUUID() } },
    )

    expect(response.status()).toBe(401)
    expect(await response.json()).toEqual({ code: 'UNAUTHORIZED', message: 'Missing or invalid token' })
  })
})
