import { decodeJwt } from '@/api/jwt'
import { env } from '@/config/env'
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

  test('API-AUTH-02 returns a token pair for the seeded operator', async ({ authApi }) => {
    const response = await authApi.login(env.operator.email, env.operator.password)

    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({ tokenType: 'Bearer', expiresIn: 900 })
    expect(body.refreshToken).toEqual(expect.any(String))

    // El rol viaja dentro del access token (JWT)
    const claims = decodeJwt(body.accessToken)
    expect(claims.role).toBe('operator')
    expect(claims.exp - claims.iat).toBe(900)
  })
})
