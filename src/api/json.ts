import type { APIResponse } from '@playwright/test'

// Lee el JSON de una respuesta esperada. Es para PREPARAR datos (setup), no para probar:
// si el estado no es el esperado lanza un error que nombra el paso, en lugar de dejar
// que la prueba falle más adelante con un mensaje confuso.
export async function jsonOf<T>(response: APIResponse, expectedStatus: number, step: string): Promise<T> {
  if (response.status() !== expectedStatus) {
    throw new Error(`${step}: expected ${expectedStatus}, got ${response.status()} ${await response.text()}`)
  }
  return (await response.json()) as T
}
