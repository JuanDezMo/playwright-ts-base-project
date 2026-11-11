// Lee el payload de un JWT sin validar la firma (eso lo hace la API).
// Sirve para verificar en las pruebas los claims que emite el backend (I-08).
export type AccessTokenClaims = {
  sub: string
  role: 'customer' | 'operator'
  iat: number
  exp: number
}

export function decodeJwt(token: string): AccessTokenClaims {
  const payload = token.split('.')[1]
  if (!payload) throw new Error('Not a JWT: missing payload')
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AccessTokenClaims
}
