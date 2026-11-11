import { randomUUID } from 'node:crypto'
import type { APIResponse } from '@playwright/test'
import type { ApiClient } from './ApiClient'

// Endpoint de transferencias (F-09). Requiere un cliente con token de cliente.
export class TransfersApi {
  constructor(private readonly client: ApiClient) {}

  // amountCents en centavos. Pasar la misma idempotencyKey simula un reintento (RN-28).
  create(
    accountOrigin: string,
    accountDestination: string,
    amountCents: number,
    idempotencyKey: string = randomUUID(),
  ): Promise<APIResponse> {
    return this.client.post(
      '/transfers',
      { accountOrigin, accountDestination, amount: amountCents },
      { headers: { 'Idempotency-Key': idempotencyKey } },
    )
  }
}
