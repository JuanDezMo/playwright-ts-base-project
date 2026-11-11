import type { APIResponse } from '@playwright/test'
import type { ApiClient } from './ApiClient'

export type AccountType = 'savings' | 'checking'

// Endpoints de cuentas (F-05 a F-07). Requiere un cliente con token.
export class AccountsApi {
  constructor(private readonly client: ApiClient) {}

  create(accountType: AccountType): Promise<APIResponse> {
    return this.client.post('/accounts', { accountType })
  }

  list(): Promise<APIResponse> {
    return this.client.get('/accounts')
  }

  getById(id: string): Promise<APIResponse> {
    return this.client.get(`/accounts/${encodeURIComponent(id)}`)
  }
}
