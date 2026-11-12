# Pruebas implementadas

**Componente** = una sola pieza aislada (un endpoint, o una pantalla con la API simulada). **E2E** = flujo completo contra el sistema real.

| Origen | Nivel | Proyecto Playwright | Pruebas |
| --- | --- | --- | ---: |
| API | Componente | `api-component` | 17 |
| API | E2E | `api-e2e` | 1 |
| UI | Componente | `ui-component` | 13 |
| UI | E2E | `ui-e2e` (y `ui-e2e-mobile`, las mismas en móvil) | 5 |

Total: 36 pruebas (+5 repetidas en móvil y 3 de verificación previa).

## Detalle

| ID | Origen | Nivel | Qué verifica |
| --- | --- | --- | --- |
| SMOKE-01 | API | Componente | Endpoint protegido sin token → 401 |
| API-AUTH-01 a 03 | API | Componente | Login: credenciales inválidas, operador correcto, bloqueo 429 |
| API-REG-01, 02 | API | Componente | Registro correcto y email repetido (409) |
| API-ACC-01 a 05 | API | Componente | Cuentas: rol, sin token, cuenta ajena, id inválido, página 0 |
| API-RCH-01 | API | Componente | Recarga en efectivo sobre el tope → 422 |
| API-TRF-01 a 05 | API | Componente | Transferencias: idempotencia, misma cuenta, saldo insuficiente, origen ajeno, sin token |
| API-E2E-01 | API | E2E | El saldo siempre es la suma de sus movimientos |
| C-01, 02 | UI | Componente | Registro: validaciones y email ya registrado |
| C-03, 04 | UI | Componente | Login: error de credenciales y cuenta regresiva tras 429 |
| C-05, 06 | UI | Componente | Transferencia: validaciones y saldo insuficiente |
| C-07, 08 | UI | Componente | Recarga: validaciones y comprobante |
| C-09 a 13 | UI | Componente | Detalle de cuenta: movimientos, vacío, paginación, página inválida, no encontrada |
| E2E-00, 00b | UI | E2E | Operador inicia sesión y con sesión guardada |
| E2E-01 | UI | E2E | Cliente nuevo abre una cuenta de ahorros |
| E2E-02 | UI | E2E | Operador recarga y el cliente ve el dinero |
| E2E-03 | UI | E2E | Transferencia de $250.00 entre cuentas propias |

## Comandos

```bash
pnpm test                  # todo
pnpm test:smoke            # solo las pruebas @smoke
pnpm test:api              # API: componente + e2e
pnpm test:ui:component     # UI · componente (API simulada)
pnpm test:ui:e2e           # UI · e2e (escritorio)
pnpm test:ui:mobile        # UI · e2e (Pixel 7)
pnpm exec playwright test --project=api-e2e                 # API · e2e
pnpm exec playwright test tests/api/component/auth          # una carpeta
pnpm exec playwright test -g "E2E-03"                       # una prueba por nombre
pnpm exec playwright test --ui                              # modo interactivo
pnpm report                # abrir el reporte HTML
pnpm typecheck && pnpm lint
```

**Requisitos:** la API en `:3000` y el frontend en `:5173`. `api-component` y `api-e2e` solo necesitan la API; `ui-component` solo el frontend; `ui-e2e` ambos.
