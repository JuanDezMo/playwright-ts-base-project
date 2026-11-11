import type { APIResponse } from '@playwright/test'
import type { ApiClient } from './ApiClient'

// Endpoints de autenticación (F-01 a F-04). Un método por endpoint.
export class AuthApi {
  constructor(private readonly client: ApiClient) {}

  login(email: string, password: string): Promise<APIResponse> {
    return this.client.post('/auth/login', { email, password })
  }
}
