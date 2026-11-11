import { randomUUID } from 'node:crypto'

// Email único por llamada: evita choques entre pruebas en paralelo y que los
// intentos fallidos de login se acumulen sobre un mismo email (RN-29).
export function uniqueEmail(prefix = 'user'): string {
  return `${prefix}.${Date.now()}.${randomUUID().slice(0, 8)}@mail.test`
}

// Contraseña válida para la API (8 a 128 caracteres)
export const validPassword = 'Lab2026pass'
