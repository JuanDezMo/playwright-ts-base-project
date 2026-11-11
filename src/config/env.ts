// Configuración del proyecto de pruebas. Se lee de variables de entorno con valores
// por defecto para el entorno local (frontend en 5173, API Go en 3000).
// Si existe un archivo .env en la raíz, se carga primero (Node 22: process.loadEnvFile).

try {
  process.loadEnvFile('.env')
} catch {
  // Sin .env: se usan las variables del sistema o los valores por defecto
}

function read(name: string, fallback: string): string {
  const value = process.env[name]
  return value && value.trim() !== '' ? value : fallback
}

export const env = {
  // Web Banking Test Lab
  baseUrl: read('BASE_URL', 'http://localhost:5173'),
  // API Go (directo, sin el proxy /api del frontend)
  apiUrl: read('API_URL', 'http://localhost:3000'),
  // Operador creado por el seed de la API
  operator: {
    email: read('OPERATOR_EMAIL', 'operator@bank.local'),
    password: read('OPERATOR_PASSWORD', 'Operator2026!'),
  },
} as const
