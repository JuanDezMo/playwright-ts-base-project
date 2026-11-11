// Datos simulados coherentes entre llamadas (escritos a mano, no generados).
// Las cuentas se usan en las pruebas de UI · componente de transferencia.
export const accounts = {
  savings: {
    id: '6f1c0000-0000-4000-8000-000000000001',
    accountNumber: '0012345678',
    accountType: 'savings',
    balance: 100000, // $1,000.00
    createdAt: '2026-11-02T10:00:00.000Z',
  },
  checking: {
    id: '9a2d0000-0000-4000-8000-000000000002',
    accountNumber: '0012345679',
    accountType: 'checking',
    balance: 0,
    createdAt: '2026-11-03T10:00:00.000Z',
  },
} as const

export type MockAccount = (typeof accounts)[keyof typeof accounts]

// Movimiento simulado de la cuenta de ahorros. Los ids de relatedAccountId apuntan a la cuenta corriente.
export type MockMovement = {
  id: string
  accountId: string
  movementType: 'recharge' | 'transfer_in' | 'transfer_out'
  amount: number
  details: { rechargeType: 'cash' | 'employer_bonus' | 'salary' } | { relatedAccountId: string }
  createdAt: string
}

// Historial de ejemplo, más reciente primero: transferencia de salida y recarga de salario
export const movements = {
  recharge: {
    id: 'a0000000-0000-4000-8000-000000000001',
    accountId: accounts.savings.id,
    movementType: 'recharge',
    amount: 150000, // $1,500.00
    details: { rechargeType: 'salary' },
    createdAt: '2026-11-09T14:30:00.000Z',
  },
  transferOut: {
    id: 'a0000000-0000-4000-8000-000000000002',
    accountId: accounts.savings.id,
    movementType: 'transfer_out',
    amount: 25000, // $250.00
    details: { relatedAccountId: accounts.checking.id },
    createdAt: '2026-11-10T09:00:00.000Z',
  },
} as const satisfies Record<string, MockMovement>

// n movimientos distintos (para probar la paginación)
export function manyMovements(n: number): MockMovement[] {
  return Array.from({ length: n }, (_, i) => ({
    ...movements.recharge,
    id: `b0000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
  }))
}
