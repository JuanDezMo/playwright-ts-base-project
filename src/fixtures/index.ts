// Punto único de entrada para las pruebas: `import { test, expect } from '@/fixtures'`.
// base.ts une API, UI, mocks y sesiones; actors.ts suma los actores (cliente, operador).
// Las fixtures son perezosas: cada prueba solo construye las que pide.
export { test, type Customer } from './actors'
export { expect } from '@playwright/test'
