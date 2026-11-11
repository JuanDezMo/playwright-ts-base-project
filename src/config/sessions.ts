import path from 'node:path'

// Archivos donde el setup guarda la sesión de cada rol (carpeta .auth/, en .gitignore)
export const sessionFiles = {
  operator: path.resolve('.auth/operator-session.json'),
} as const

// Clave que usa el frontend para la sesión en sessionStorage (Zustand persist)
export const sessionStorageKey = 'btl-session'
