import { expect, test } from '@/fixtures'

// Prueba de humo: la API está levantada y protege sus endpoints
test('SMOKE-01 protected endpoint without token returns 401', async ({ apiClient }) => {
  const response = await apiClient.get('/accounts')

  expect(response.status()).toBe(401)
  expect(await response.json()).toEqual({
    code: 'UNAUTHORIZED',
    message: 'Missing or invalid token',
  })
})
