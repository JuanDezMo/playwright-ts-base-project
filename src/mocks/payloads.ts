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
