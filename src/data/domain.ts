// Tipos del dominio bancario compartidos por varias capas (api, pages, fixtures).
// Viven en data/ para que las páginas no tengan que importar de api/.
export type AccountType = 'savings' | 'checking'
export type RechargeType = 'cash' | 'employer_bonus' | 'salary'

// Tipos de las respuestas de la API, tomados del contrato (pnpm gen:types)
import type { components } from '../mocks/api-types'
export type Account = components['schemas']['Account']
export type Movement = components['schemas']['Movement']
export type MovementPage = components['schemas']['MovementPage']
export type TransferResult = components['schemas']['TransferResult']
export type TokenPair = components['schemas']['TokenPair']
export type ApiError = components['schemas']['Error']
