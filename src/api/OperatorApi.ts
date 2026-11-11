import { randomUUID } from 'node:crypto'
import type { APIResponse } from '@playwright/test'
import type { RechargeType } from '../data/domain'
import type { ApiClient } from './ApiClient'

// Endpoints del operador (F-08). Requiere un cliente con token de operador.
export class OperatorApi {
  constructor(private readonly client: ApiClient) {}

  // amountCents en centavos (150000 = $1,500.00). Cada llamada es una operación nueva:
  // se envía una Idempotency-Key distinta, salvo que la prueba pase una (reintentos).
  recharge(
    accountNumber: string,
    amountCents: number,
    rechargeType: RechargeType,
    idempotencyKey: string = randomUUID(),
  ): Promise<APIResponse> {
    return this.client.post(
      '/recharge',
      { accountNumber, amount: amountCents, rechargeType },
      { headers: { 'Idempotency-Key': idempotencyKey } },
    )
  }
}
