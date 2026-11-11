import { newCustomer } from '@/data/factories'
import { expect, test } from '@/fixtures'

test.describe('Register screen', () => {
  test('C-01 validates the empty form in the browser', async ({ register, registerUi }) => {
    // Sin mock: la validación ocurre en el navegador y no llega a la API
    await register.goto()
    await register.submitEmpty()

    await expect(registerUi.nameError).toHaveText('Invalid name')
    await expect(registerUi.emailError).toHaveText('Invalid email')
    await expect(registerUi.passwordError).toHaveText('Password too short')
    // Estado accesible: los campos inválidos lo indican con aria-invalid
    await expect(registerUi.name).toHaveAttribute('aria-invalid', 'true')
    await expect(registerUi.email).toHaveAttribute('aria-invalid', 'true')
    await expect(registerUi.password).toHaveAttribute('aria-invalid', 'true')
  })

  test('C-02 shows the email already registered error', async ({ mockApi, register, registerUi }) => {
    await mockApi.register.emailAlreadyRegistered()
    await register.goto()

    await register.submit(newCustomer())

    await expect(registerUi.errorAlert).toContainText('Registration failed')
    await expect(registerUi.errorAlert).toContainText('Email already registered')
  })
})
