import { uniqueEmail, validPassword } from '@/data/factories'
import { expect, test } from '@/fixtures'

test.describe('POST /auth/login', () => {
  test('API-AUTH-01 rejects invalid credentials with 401', async ({ authApi }) => {
    // Email único: el intento fallido no bloquea a ningún usuario real
    const response = await authApi.login(uniqueEmail('invalid'), validPassword)

    expect(response.status()).toBe(401)
    expect(await response.json()).toEqual({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
    })
  })
})
