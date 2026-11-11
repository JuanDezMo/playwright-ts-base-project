import { expect, test } from '@/fixtures'
import { uniqueEmail, validPassword } from '@/data/factories'

test.describe('Login screen', () => {
  test('C-03 shows the invalid credentials error', async ({ mockApi, login, loginUi }) => {
    // Preparar: la API responde 401 sin necesidad del backend
    await mockApi.login.invalidCredentials()
    await login.goto()

    // Actuar
    await login.signIn(uniqueEmail('invalid'), validPassword)

    // Verificar en la UI
    await expect(loginUi.errorAlert).toContainText('Sign in failed')
    await expect(loginUi.errorAlert).toContainText('Invalid email or password')
  })

  test('C-04 locks the form with a countdown after a 429', async ({ page, mockApi, login, loginUi }) => {
    // Reloj del navegador falso y PAUSADO: solo avanza cuando la prueba lo indica.
    // (install() solo lo falsea; sin pauseAt el tiempo sigue corriendo a velocidad real)
    const start = new Date('2026-11-10T10:00:00Z')
    await page.clock.install({ time: start })
    await page.clock.pauseAt(new Date(start.getTime() + 1_000))

    // El 429 real exige 5 intentos fallidos; aquí se simula al instante
    await mockApi.login.tooManyRequests(75)
    await login.goto()
    await login.signIn(uniqueEmail('locked'), validPassword)

    await expect(loginUi.lockoutAlert).toContainText('Too many login attempts')
    await expect(loginUi.lockoutCountdown).toHaveText('1:15')
    await expect(loginUi.submitButton).toBeDisabled()

    // Avanzar 1 segundo de reloj: la cuenta baja sin esperar de verdad.
    // (Cada tick programa el siguiente después de renderizar, por eso se avanza de a uno)
    await page.clock.runFor(1_000)
    await expect(loginUi.lockoutCountdown).toHaveText('1:14')
  })
})
