import { randomUUID } from 'node:crypto'
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
    expect(await replay.json()).toEqual(await first.json())
    expect(replay.headers()['idempotent-replayed']).toBe('true')

    // El dinero se movió una sola vez: $1,000.00 - $100.00
    const origin = await customerAccountsApi.getById(savings.id)
    expect(((await origin.json()) as { balance: number }).balance).toBe(90000)
  })
})
