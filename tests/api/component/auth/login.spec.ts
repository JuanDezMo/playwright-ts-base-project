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

  test('API-AUTH-02 returns a token pair for the seeded operator', { tag: '@smoke' }, async ({ authApi }) => {
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

  test('API-AUTH-03 locks the email after 5 failed attempts with 429 and Retry-After', async ({ authApi }) => {
    // Email único: el bloqueo (15 minutos) no afecta a ningún usuario real ni a otras pruebas
    const email = uniqueEmail('lockout')

    for (let attempt = 1; attempt <= 5; attempt++) {
      const failed = await authApi.login(email, validPassword)
      expect(failed.status(), `attempt ${attempt} should fail with 401`).toBe(401)
    }

    const locked = await authApi.login(email, validPassword)

    expect(locked.status()).toBe(429)
    expect(await locked.json()).toEqual({
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts',
    })
    // Segundos hasta que el intento más antiguo salga de la ventana de 15 minutos (RN-29)
    const retryAfter = Number(locked.headers()['retry-after'])
    expect(retryAfter).toBeGreaterThan(0)
    expect(retryAfter).toBeLessThanOrEqual(15 * 60)
  })
})
