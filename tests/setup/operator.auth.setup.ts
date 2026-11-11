import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { env } from '@/config/env'
import { sessionFiles, sessionStorageKey } from '@/config/sessions'
import { expect, test as setup } from '@/fixtures'

// Inicia sesión una vez como operador y guarda la sesión para reutilizarla.
// La app guarda la sesión en sessionStorage, que storageState() NO incluye
// (solo cookies y localStorage): por eso se lee y se guarda a mano.
setup('save operator session', async ({ page, login, operatorUi }) => {
  await login.loginAs(env.operator, '/operator')
  await expect(operatorUi.heading).toBeVisible()

  const session = await page.evaluate((key) => sessionStorage.getItem(key), sessionStorageKey)
  expect(session, 'The app did not store a session after login').not.toBeNull()

  await mkdir(path.dirname(sessionFiles.operator), { recursive: true })
  await writeFile(sessionFiles.operator, session!)
})
