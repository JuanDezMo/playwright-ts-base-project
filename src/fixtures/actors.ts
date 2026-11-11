import { AccountsApi } from '../api/AccountsApi'
import type { ApiClient } from '../api/ApiClient'
import { env } from '../config/env'
import { newCustomer } from '../data/factories'
import { test as base } from './base'

// Un cliente creado para la prueba, con su token de API
export type Customer = {
  name: string
  email: string
  password: string
  client: ApiClient
}

export type ActorFixtures = {
  // Cliente nuevo registrado por API (sin cuentas, sin sesión en el navegador)
  customer: Customer
  // El mismo cliente con la sesión iniciada en el navegador (por la UI)
  customerSession: Customer
  customerAccountsApi: AccountsApi
  // Operador del seed con su token de API
  operatorClient: ApiClient
  operatorAccountsApi: AccountsApi
}

// Lee el access token de una respuesta de login; falla con un mensaje claro si no hay
async function accessTokenFrom(response: Awaited<ReturnType<ApiClient['post']>>): Promise<string> {
  if (!response.ok()) throw new Error(`Login failed during setup: ${response.status()} ${await response.text()}`)
  return ((await response.json()) as { accessToken: string }).accessToken
}

// Actores: preparan datos por API (rápido) y, si hace falta, la sesión por la UI
export const test = base.extend<ActorFixtures>({
  customer: async ({ apiClient, authApi }, use) => {
    const data = newCustomer()
    const created = await authApi.register(data.name, data.email, data.password)
    if (created.status() !== 201) throw new Error(`Register failed during setup: ${created.status()}`)
    const token = await accessTokenFrom(await authApi.login(data.email, data.password))
    await use({ ...data, client: apiClient.withToken(token) })
  },
  customerSession: async ({ customer, login }, use) => {
    await login.loginAs(customer, '/accounts')
    await use(customer)
  },
  customerAccountsApi: async ({ customer }, use) => {
    await use(new AccountsApi(customer.client))
  },
  operatorClient: async ({ apiClient, authApi }, use) => {
    const token = await accessTokenFrom(await authApi.login(env.operator.email, env.operator.password))
    await use(apiClient.withToken(token))
  },
  operatorAccountsApi: async ({ operatorClient }, use) => {
    await use(new AccountsApi(operatorClient))
  },
})
