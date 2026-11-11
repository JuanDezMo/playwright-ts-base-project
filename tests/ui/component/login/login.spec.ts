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
})
