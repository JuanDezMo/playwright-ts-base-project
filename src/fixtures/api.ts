import { test as base } from '@playwright/test'
import { ApiClient } from '../api/ApiClient'
import { AuthApi } from '../api/AuthApi'
import { env } from '../config/env'

export type ApiFixtures = {
  apiClient: ApiClient
  authApi: AuthApi
}

// Fixtures de API: construyen los clientes y los entregan listos a la prueba.
export const test = base.extend<ApiFixtures>({
  apiClient: async ({ playwright }, use) => {
    // Contexto propio apuntando SIEMPRE a la API. La fixture nativa `request` usa el
    // baseURL del proyecto, que en los proyectos de UI es el frontend (5173), no la API.
    const request = await playwright.request.newContext({ baseURL: env.apiUrl })
    await use(new ApiClient(request))
    await request.dispose()
  },
  authApi: async ({ apiClient }, use) => {
    await use(new AuthApi(apiClient))
  },
})
