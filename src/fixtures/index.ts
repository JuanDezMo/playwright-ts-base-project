import { mergeTests } from '@playwright/test'
import { test as apiTest } from './api'
import { test as mocksTest } from './mocks'
import { test as uiTest } from './ui'

// Punto único de entrada para las pruebas: `import { test, expect } from '@/fixtures'`.
// mergeTests combina las fixtures de API, UI y mocks; cada prueba pide solo las que usa
// (son perezosas: una prueba de API nunca abre un navegador).
export const test = mergeTests(apiTest, uiTest, mocksTest)
export { expect } from '@playwright/test'
