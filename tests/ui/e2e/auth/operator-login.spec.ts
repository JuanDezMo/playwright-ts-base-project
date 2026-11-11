import { env } from '@/config/env'
import { expect, test } from '@/fixtures'

test.describe('Operator login (real API)', () => {
  test('E2E-00 the seeded operator signs in and lands on Operations', { tag: '@smoke' }, async ({ page, login, operatorUi }) => {
    await login.goto()
    await login.signIn(env.operator.email, env.operator.password)

    await expect(page).toHaveURL(/\/operator$/)
    await expect(operatorUi.heading).toBeVisible()
  })

  test('E2E-00b opens Operations with the saved session, without signing in', async ({ asOperator, page, operatorUi }) => {
    void asOperator // la fixture ya inyectó la sesión guardada por el setup
    await page.goto('/operator')

    await expect(page).toHaveURL(/\/operator$/)
    await expect(operatorUi.heading).toBeVisible()
  })
})
