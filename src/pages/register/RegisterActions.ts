import type { Page } from '@playwright/test'
import type { RegisterLocators } from './RegisterLocators'

export type RegisterData = { name: string; email: string; password: string }

// Cómo se opera la pantalla de registro
export class RegisterActions {
  constructor(
    private readonly page: Page,
    private readonly ui: RegisterLocators,
  ) {}

  async goto(): Promise<void> {
    await this.page.goto('/register')
  }

  async submit({ name, email, password }: RegisterData): Promise<void> {
    await this.ui.name.fill(name)
    await this.ui.email.fill(email)
    await this.ui.password.fill(password)
    await this.ui.submitButton.click()
  }

  // Envía el formulario sin llenar nada (validación del navegador)
  async submitEmpty(): Promise<void> {
    await this.ui.submitButton.click()
  }
}
