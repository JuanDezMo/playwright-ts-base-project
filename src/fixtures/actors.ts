import type { Page } from '@playwright/test'
import { AccountsApi } from '../api/AccountsApi'
import type { ApiClient } from '../api/ApiClient'
import { OperatorApi } from '../api/OperatorApi'
import { TransfersApi } from '../api/TransfersApi'
import { env } from '../config/env'
import { newCustomer } from '../data/factories'
import { DashboardActions, DashboardLocators } from '../pages/dashboard'
import { LoginActions, LoginLocators } from '../pages/login'
import { test as base } from './base'

// Un cliente creado para la prueba, con su token de API
export type Customer = {
  name: string
  email: string
  password: string
  client: ApiClient
}

// Navegador aparte (otro contexto) con el cliente logueado: permite que dos
// usuarios usen la app a la vez en la misma prueba (operador y cliente)
export type CustomerBrowser = {
  page: Page
  dashboard: DashboardActions
  dashboardUi: DashboardLocators
}

type AccountRef = { id: string; accountNumber: string }

// Cliente con dos cuentas y saldo: ahorros con $1,000.00 y corriente con $0.00
export type CustomerWithFunds = Customer & {
  savings: AccountRef
  checking: AccountRef
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
  operatorApi: OperatorApi
  customerBrowser: CustomerBrowser
  customerTransfersApi: TransfersApi
  customerWithFunds: CustomerWithFunds
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
  operatorApi: async ({ operatorClient }, use) => {
    await use(new OperatorApi(operatorClient))
  },
  customerTransfersApi: async ({ customer }, use) => {
    await use(new TransfersApi(customer.client))
  },
  customerWithFunds: async ({ customer, customerAccountsApi, operatorApi }, use) => {
    // Todo por API: rápido y sin depender de la UI
    const open = async (type: 'savings' | 'checking'): Promise<AccountRef> => {
      const response = await customerAccountsApi.create(type)
      if (response.status() !== 201) throw new Error(`Create ${type} failed during setup: ${response.status()}`)
      return (await response.json()) as AccountRef
    }
    const savings = await open('savings')
    const checking = await open('checking')
    const recharged = await operatorApi.recharge(savings.accountNumber, 100000, 'salary')
    if (recharged.status() !== 201) throw new Error(`Recharge failed during setup: ${recharged.status()}`)
    await use({ ...customer, savings, checking })
  },
  customerBrowser: async ({ browser, customer }, use) => {
    // Un contexto nuevo no hereda el baseURL del proyecto: se indica explícitamente
    const context = await browser.newContext({ baseURL: env.baseUrl })
    const page = await context.newPage()
    await new LoginActions(page, new LoginLocators(page)).loginAs(customer, '/accounts')
    const dashboardUi = new DashboardLocators(page)
    await use({ page, dashboardUi, dashboard: new DashboardActions(page, dashboardUi) })
    await context.close()
  },
})
