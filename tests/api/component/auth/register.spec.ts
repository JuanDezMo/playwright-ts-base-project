import { newCustomer } from '@/data/factories'
import { expect, test } from '@/fixtures'

test.describe('POST /auth/register', () => {
  test('API-REG-01 creates a customer and never returns the password', async ({ authApi }) => {
    const customer = newCustomer()

    const response = await authApi.register(customer.name, customer.email, customer.password)

    expect(response.status()).toBe(201)
    const body = await response.json()
    expect(body).toMatchObject({ name: customer.name, email: customer.email, role: 'customer' })
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(body).not.toHaveProperty('password')
  })

  test('API-REG-02 rejects an email that is already registered with 409', async ({ authApi }) => {
    const customer = newCustomer()
    // Preparar: el primer registro crea el email (si falla, la prueba no tendría sentido)
    const created = await authApi.register(customer.name, customer.email, customer.password)
    expect(created.status(), 'setup: first registration').toBe(201)

    // El email se compara sin distinguir mayúsculas (RN-25)
    const response = await authApi.register('Other', customer.email.toUpperCase(), customer.password)

    expect(response.status()).toBe(409)
    expect(await response.json()).toEqual({
      code: 'EMAIL_ALREADY_REGISTERED',
      message: 'Email already registered',
    })
  })
})
