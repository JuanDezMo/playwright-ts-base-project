import type { Account, Movement, MovementPage } from '@/data/domain'
import { expect, test } from '@/fixtures'

// Signo de un movimiento: recargas y entradas suman; salidas y retiros restan (RN-17)
const signed = (m: Movement) =>
  m.movementType === 'recharge' || m.movementType === 'transfer_in' ? m.amount : -m.amount

test.describe('Money flow (API only)', () => {
  test(
    'API-E2E-01 balances always equal the sum of their movements',
    { tag: '@smoke' },
    async ({ customerAccountsApi, operatorApi, customerTransfersApi }) => {
      // 1. Un cliente nuevo (lo registra la fixture customerAccountsApi) abre dos cuentas
      const savings = (await (await customerAccountsApi.create('savings')).json()) as Account
      const checking = (await (await customerAccountsApi.create('checking')).json()) as Account

      // 2. El operador recarga $1,000.00 en ahorros
      const recharge = await operatorApi.recharge(savings.accountNumber, 100000, 'salary')
      expect(recharge.status()).toBe(201)

      // 3. El cliente transfiere $250.00 de ahorros a corriente
      const transfer = await customerTransfersApi.create(savings.accountNumber, checking.accountNumber, 25000)
      expect(transfer.status()).toBe(201)

      // 4. Cada saldo coincide con la suma firmada de sus movimientos (RN-17)
      for (const [account, expectedBalance, expectedMovements] of [
        [savings, 75000, 2],
        [checking, 25000, 1],
      ] as const) {
        const current = (await (await customerAccountsApi.getById(account.id)).json()) as Account
        const { items } = (await (await customerAccountsApi.movements(account.id)).json()) as MovementPage

        expect(current.balance).toBe(expectedBalance)
        expect(items).toHaveLength(expectedMovements)
        expect(items.reduce((sum, m) => sum + signed(m), 0)).toBe(current.balance)
      }
    },
  )
})
