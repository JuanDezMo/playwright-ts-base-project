import type { Page } from '@playwright/test'
import { AccountsApi } from '../api/AccountsApi'
import type { ApiClient } from '../api/ApiClient'
import { OperatorApi } from '../api/OperatorApi'
import { TransfersApi } from '../api/TransfersApi'
import { env } from '../config/env'
import { jsonOf } from '../api/json'
import type { AuthApi } from '../api/AuthApi'
import { newCustomer } from '../data/factories'
import type { Account, TokenPair } from '../data/domain'
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

type AccountRef = Pick<Account, 'id' | 'accountNumber'>

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
  // Un segundo cliente, ajeno al primero: sirve para probar que no ve ni usa cuentas ajenas
  otherCustomer: Customer
  otherCustomerAccountsApi: AccountsApi
  // Operador del seed con su token de API
  operatorClient: ApiClient
  operatorAccountsApi: AccountsApi
  operatorApi: OperatorApi
  customerBrowser: CustomerBrowser
  customerTransfersApi: TransfersApi
  customerWithFunds: CustomerWithFunds
}

// Registra un cliente nuevo por API y devuelve su cliente HTTP con token
async function registerCustomer(apiClient: ApiClient, authApi: AuthApi): Promise<Customer> {
  const data = newCustomer()
  await jsonOf(await authApi.register(data.name, data.email, data.password), 201, 'setup: register customer')
  const token = await accessTokenFrom(await authApi.login(data.email, data.password))
  return { ...data, client: apiClient.withToken(token) }
}

async function accessTokenFrom(response: Awaited<ReturnType<ApiClient['post']>>): Promise<string> {
  return (await jsonOf<TokenPair>(response, 200, 'setup: login')).accessToken
}

// Actores: preparan datos por API (rápido) y, si hace falta, la sesión por la UI
export const test = base.extend<ActorFixtures>({
  customer: async ({ apiClient, authApi }, use) => {
    await use(await registerCustomer(apiClient, authApi))
  },
  otherCustomer: async ({ apiClient, authApi }, use) => {
    await use(await registerCustomer(apiClient, authApi))
  },
  otherCustomerAccountsApi: async ({ otherCustomer }, use) => {
    await use(new AccountsApi(otherCustomer.client))
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
    const open = async (type: 'savings' | 'checking'): Promise<AccountRef> =>
      jsonOf<Account>(await customerAccountsApi.create(type), 201, `setup: create ${type} account`)
    const savings = await open('savings')
    const checking = await open('checking')
    await jsonOf(await operatorApi.recharge(savings.accountNumber, 100000, 'salary'), 201, 'setup: recharge savings')
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
