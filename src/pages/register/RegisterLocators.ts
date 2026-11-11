import type { Locator, Page } from '@playwright/test'

// Pantalla de registro (/register)
export class RegisterLocators {
  readonly heading: Locator
  readonly name: Locator
  readonly email: Locator
  readonly password: Locator
  readonly submitButton: Locator
  readonly errorAlert: Locator
  readonly nameError: Locator
  readonly emailError: Locator
  readonly passwordError: Locator

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { name: 'Create your account' })
    this.name = page.getByLabel('Full name')
    this.email = page.getByLabel('Email')
    this.password = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Create account' })
    this.errorAlert = page.getByTestId('register-error-alert')
    // Mensajes bajo cada campo: el input los referencia con aria-describedby
    this.nameError = page.locator('#register-name-error')
    this.emailError = page.locator('#register-email-error')
    this.passwordError = page.locator('#register-password-error')
  }
}
