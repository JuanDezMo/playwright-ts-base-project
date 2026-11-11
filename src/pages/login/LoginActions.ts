import type { Page } from '@playwright/test'
import type { LoginLocators } from './LoginLocators'

// Cómo se opera la pantalla de login. Si cambia el flujo, solo cambia este archivo.
// No hace aserciones: eso le corresponde a la prueba.
export class LoginActions {
  constructor(
    private readonly page: Page,
    private readonly ui: LoginLocators,
  ) {}

  async goto(): Promise<void> {
    await this.page.goto('/login')
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.ui.email.fill(email)
    await this.ui.password.fill(password)
    await this.ui.submitButton.click()
  }
}
