// Tipos del dominio bancario compartidos por varias capas (api, pages, fixtures).
// Viven en data/ para que las páginas no tengan que importar de api/.
export type AccountType = 'savings' | 'checking'
export type RechargeType = 'cash' | 'employer_bonus' | 'salary'
