// Sesión simulada para pruebas de componente: el frontend solo LEE el rol del JWT
// (la firma la valida siempre el backend, que en estas pruebas está simulado).
type Role = 'customer' | 'operator'

const base64url = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')

export function fakeSessionValue(role: Role, email: string): string {
  const now = Math.floor(Date.now() / 1000)
  const payload = { sub: '00000000-0000-4000-8000-000000000001', role, iat: now, exp: now + 900 }
  const accessToken = `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url(payload)}.fake-signature`
  // Mismo formato que guarda el frontend (Zustand persist)
  return JSON.stringify({
    state: { accessToken, refreshToken: 'fake-refresh', user: { id: payload.sub, role, email } },
    version: 0,
  })
}
