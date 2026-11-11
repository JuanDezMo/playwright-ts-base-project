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

  // Login completo: abre la pantalla, envía las credenciales y espera a llegar
  // a la página de inicio del rol (/accounts o /operator)
  async loginAs(credentials: { email: string; password: string }, landingPath: string): Promise<void> {
    await this.goto()
    await this.signIn(credentials.email, credentials.password)
    await this.page.waitForURL(`**${landingPath}`)
  }
}
