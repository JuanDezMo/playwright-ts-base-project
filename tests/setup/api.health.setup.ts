import { expect, test as setup } from '@playwright/test'
import { env } from '@/config/env'

// Verificación previa: si la API no responde, las pruebas que dependen de ella
// no se ejecutan y el error lo dice claramente (en lugar de fallar una por una).
setup('API is reachable', async ({ request }) => {
  const response = await request.get(`${env.apiUrl}/accounts`).catch(() => null)
  expect(response, `API not reachable at ${env.apiUrl}. Start ../accounts_api/go_accounts_api`).not.toBeNull()
  // Sin token debe responder 401: confirma que es la API correcta
  expect(response!.status(), `Unexpected response from ${env.apiUrl}/accounts`).toBe(401)
})
