import { readFile } from 'node:fs/promises'
import { test as base } from '@playwright/test'
import { sessionFiles, sessionStorageKey } from '../config/sessions'
import { fakeSessionValue } from '../data/fakeSession'

export type SessionFixtures = {
  // Pide esta fixture para abrir la app ya autenticado como operador
  asOperator: void
  // Sesión simulada de operador para UI · componente (no necesita la API)
  asFakeOperator: void
  // Sesión simulada de cliente para UI · componente (no necesita la API)
  asFakeCustomer: void
}

// Reinyecta en sessionStorage la sesión guardada por el setup, ANTES de que cargue
// la app (addInitScript se ejecuta en cada navegación de la página).
export const test = base.extend<SessionFixtures>({
  asOperator: async ({ page }, use) => {
    const session = await readFile(sessionFiles.operator, 'utf8')
    await page.addInitScript(
      ([key, value]) => window.sessionStorage.setItem(key, value),
      [sessionStorageKey, session] as const,
    )
    await use()
  },
  asFakeCustomer: async ({ page }, use) => {
    const session = fakeSessionValue('customer', 'ana@mail.test')
    await page.addInitScript(
      ([key, value]) => window.sessionStorage.setItem(key, value),
      [sessionStorageKey, session] as const,
    )
    await use()
  },
  asFakeOperator: async ({ page }, use) => {
    const session = fakeSessionValue('operator', 'operator@bank.local')
    await page.addInitScript(
      ([key, value]) => window.sessionStorage.setItem(key, value),
      [sessionStorageKey, session] as const,
    )
    await use()
  },
})
