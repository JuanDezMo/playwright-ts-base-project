import type { APIRequestContext, APIResponse } from '@playwright/test'

type RequestOptions = {
  headers?: Record<string, string>
  params?: Record<string, string | number>
}

// Cliente base de la API: centraliza el token y los headers comunes.
// Devuelve la respuesta tal cual; las aserciones las hace siempre la prueba.
export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string,
  ) {}

  // Devuelve un cliente nuevo que envía "Authorization: Bearer <token>"
  withToken(token: string): ApiClient {
    return new ApiClient(this.request, token)
  }

  get(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.request.get(path, { headers: this.headers(options.headers), params: options.params })
  }

  post(path: string, data?: unknown, options: RequestOptions = {}): Promise<APIResponse> {
    return this.request.post(path, { data, headers: this.headers(options.headers) })
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}`, ...extra } : extra
  }
}
