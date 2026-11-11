import { expect, test } from '@playwright/test'

// Prueba de humo (iteración 0): la API está levantada y protege sus endpoints.
// Usa la fixture nativa `request`; los clientes de API llegan en la iteración 1.
test('SMOKE-01 protected endpoint without token returns 401', async ({ request }) => {
  const response = await request.get('/accounts')

  expect(response.status()).toBe(401)
  expect(await response.json()).toEqual({
    code: 'UNAUTHORIZED',
    message: 'Missing or invalid token',
  })
})
