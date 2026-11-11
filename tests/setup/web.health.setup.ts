import { expect, test as setup } from '@playwright/test'
import { env } from '@/config/env'

// Verificación previa del frontend (Banking Test Lab)
setup('web app is reachable', async ({ request }) => {
  const response = await request.get(env.baseUrl).catch(() => null)
  expect(
    response,
    `Web app not reachable at ${env.baseUrl}. Run "pnpm dev" in ../banking_frontend_lab`,
  ).not.toBeNull()
  expect(response!.ok(), `Unexpected response from ${env.baseUrl}`).toBe(true)
})
