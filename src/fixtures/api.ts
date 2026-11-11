import { test as base } from '@playwright/test'
import { ApiClient } from '../api/ApiClient'
import { AuthApi } from '../api/AuthApi'

export type ApiFixtures = {
  apiClient: ApiClient
  authApi: AuthApi
}

// Fixtures de API: construyen los clientes y los entregan listos a la prueba.
// `request` es la fixture nativa de Playwright, con el baseURL del proyecto.
export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request))
  },
  authApi: async ({ apiClient }, use) => {
    await use(new AuthApi(apiClient))
  },
})
