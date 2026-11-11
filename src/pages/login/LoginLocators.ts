import type { Locator, Page } from '@playwright/test'

// Qué elementos tiene la pantalla de login y cómo se encuentran.
// Si cambia el HTML, solo cambia este archivo.
export class LoginLocators {
  readonly heading: Locator
  readonly email: Locator
  readonly password: Locator
  readonly submitButton: Locator
  readonly errorAlert: Locator
  readonly lockoutAlert: Locator
  readonly lockoutCountdown: Locator

  // Los localizadores se crean en el constructor: si fueran campos con inicializador
  // (`readonly email = this.page.getByLabel(...)`), se evaluarían antes de que
  // `page` exista y fallarían en tiempo de ejecución.
  constructor(page: Page) {
    this.heading = page.getByRole('heading', { name: 'Sign in' })
    this.email = page.getByLabel('Email')
    this.password = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Sign in' })
    this.errorAlert = page.getByTestId('login-error-alert')
    this.lockoutAlert = page.getByTestId('login-lockout-alert')
    // La cuenta regresiva usa role="timer" (no anuncia cada segundo al lector de pantalla)
    this.lockoutCountdown = page.getByRole('timer')
  }
}
