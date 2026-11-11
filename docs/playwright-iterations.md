# Planificación por iteraciones del proyecto Playwright

Plan de implementación del proyecto de pruebas descrito en [playwright-plan.md](playwright-plan.md). Las pruebas C-xx y E2E-xx están en [minimum-tests.md](minimum-tests.md); las nuevas se listan al final.

## Principios

- **Iteraciones cortas:** cada una termina con pruebas que se ejecutan y pasan; nunca solo con estructura.
- **Aprender comparando:** las primeras iteraciones prueban **el mismo escenario del login en distintos niveles** (API, UI con mock, UI e2e) y registran la comparación.
- **Después, por funcionalidad:** registro, cuentas, recarga y transferencia, cada una con su prueba de componente, su e2e y su prueba de API.
- **Se construye solo lo que la prueba necesita:** cada Locator, Action, cliente de API o fixture nace junto con la primera prueba que lo usa.
- **Tareas medibles:** cada tarea tiene un criterio de terminado que se puede comprobar.

## Resumen

| #   | Iteración                          | Pruebas                            | Valor que entrega                                                    |
| --- | ---------------------------------- | ---------------------------------- | -------------------------------------------------------------------- |
| 0   | Proyecto base                      | 1 de humo                          | El proyecto ejecuta pruebas y genera reporte                         |
| 1   | Primera prueba de API · componente | API-AUTH-01                        | Patrón de API: cliente + fixture + prueba, sin navegador             |
| 2   | Primera prueba de UI · componente  | C-03                               | Patrón de UI: mock + Locators + Actions + fixture. **Comparativa 1** |
| 3   | Login correcto: API y e2e          | API-AUTH-02, E2E-00                | Patrón e2e contra la API real y sesión guardada. **Comparativa 2**   |
| 4   | Bloqueo de login: cuándo simular   | API-AUTH-03, C-04                  | Criterio para elegir entre API real y mock. **Comparativa 3**        |
| 5   | Registro                           | C-01, C-02, API-REG-01, API-REG-02 | Funcionalidad completa en tres niveles                               |
| 6   | Cuentas                            | E2E-01, API-ACC-01                 | Datos preparados por API y dashboard probado                         |
| 7   | Recarga                            | C-07, C-08, E2E-02, API-RCH-01     | Flujo del operador completo                                          |
| 8   | Transferencia                      | C-05, C-06, E2E-03, API-TRF-01     | La regla de negocio más crítica cubierta                             |
| 9   | Mocks desde OpenAPI                | Las C-xx existentes                | Los mocks no se desalinean del contrato                              |
| 10  | API · e2e, smoke y móvil           | API-E2E-01, @smoke, móvil          | Flujos de negocio y ejecución rápida                                 |
| 11  | Integración continua               | Todas                              | Pruebas automáticas en cada cambio                                   |

Tamaño estimado: **S** ≈ media jornada, **M** ≈ una jornada.

---

## Iteración 0 · Proyecto base (S)

**Estado:** completada. La prueba de humo se llama `SMOKE-01` y vive en `tests/api/component/health/smoke.spec.ts`; por eso el proyecto `api-component` (tarea 1.1) ya existe.

**Objetivo:** un proyecto que ejecuta una prueba y genera el reporte.

| #   | Tarea                                                                                                                                                                   | Criterio de terminado                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 0.1 | Crear el proyecto `playwright_base_project` con pnpm, `@playwright/test` y TypeScript | `pnpm test` ejecuta y pasa |
| 0.2 | Borrar los ejemplos y crear la estructura `src/` y `tests/` vacía                                                                                                       | Las carpetas coinciden con la sección 3 de `playwright-plan.md` |
| 0.3 | Crear `src/config/env.ts` con `BASE_URL` (`http://localhost:5173`), `API_URL` (`http://localhost:3000`) y las credenciales del operador, leídos de variables de entorno | Cambiar una variable de entorno se refleja en la ejecución      |
| 0.4 | Configurar `playwright.config.ts` con el reporte HTML y `trace: 'on-first-retry'`                                                                                       | `pnpm exec playwright show-report` abre el reporte                    |
| 0.5 | Prueba de humo: `GET /accounts` sin token responde 401                                                                                                                  | `pnpm exec playwright test` pasa (1 prueba)                           |
| 0.6 | README con requisitos (API y frontend levantados) y scripts                                                                                                             | Otra persona puede ejecutar la prueba siguiendo el README       |
| 0.7 | Crear `docs/comparisons.md` con la plantilla de la sección final                                                                                                        | El archivo existe con las tres comparativas vacías              |

## Iteración 1 · Primera prueba de API · componente: API-AUTH-01 (S)

**Estado:** completada. La prueba está en `tests/api/component/auth/login.spec.ts`; las pruebas importan desde `@/fixtures` (alias `@/` → `src/`). 6 ejecuciones seguidas pasan sin 429 (~130 ms cada una).

**Objetivo:** el patrón de una prueba de API con el escenario más simple: login con credenciales inválidas.

| #   | Tarea                                                                                                              | Criterio de terminado                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| 1.1 | Agregar el proyecto `api-component` (`testDir: tests/api/component`, `baseURL: API_URL`)                           | `pnpm test:api` ejecuta solo esa carpeta y no abre navegador                                   |
| 1.2 | `src/api/ApiClient.ts`: envuelve `request` (baseURL, JSON, token opcional)                                         | Devuelve la `Response`; no tiene aserciones                                                       |
| 1.3 | `src/api/AuthApi.ts`: `login(email, password)`                                                                     | Usa `ApiClient`                                                                                   |
| 1.4 | `src/fixtures/api.ts` e `index.ts`: fixture `authApi`                                                              | La prueba no hace `new` de nada                                                                   |
| 1.5 | `tests/api/component/auth/login.spec.ts` con API-AUTH-01                                                           | Pasa: estado 401 y cuerpo `{ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }` |
| 1.6 | Usar un email único (`uniqueEmail()` en `src/data/factories.ts`) para no sumar intentos fallidos a un usuario real | Ejecutar la prueba 6 veces seguidas no provoca 429                                                |

## Iteración 2 · Primera prueba de UI · componente: C-03 (S)

**Estado:** completada. Prueba en `tests/ui/component/login/login.spec.ts`; comparativa 1 en `comparisons.md`. Aprendizaje: los localizadores se crean **en el constructor** (como campos con inicializador fallan porque `page` aún no existe).

**Objetivo:** el mismo escenario en la UI con la API simulada, y la primera comparación.

| #   | Tarea                                                                                                 | Criterio de terminado                                                 |
| --- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 2.1 | Agregar el proyecto `ui-component` (`testDir: tests/ui/component`, `baseURL: BASE_URL`)               | `pnpm test:ui:component` ejecuta solo esa carpeta                  |
| 2.2 | `src/pages/login/LoginLocators.ts`: email, password, botón "Sign in" y alerta de error                | Solo usa `getByLabel`, `getByRole` y `getByTestId`; no tiene acciones |
| 2.3 | `src/pages/login/LoginActions.ts`: `goto()` y `signIn(email, password)`                               | Recibe `LoginLocators` en el constructor; no tiene `expect`           |
| 2.4 | `src/mocks/handlers.ts`: `mockLogin.invalidCredentials(page)` con `page.route` y 401 (escrito a mano) | Responde `{ code, message }` igual que la API                         |
| 2.5 | `src/fixtures/ui.ts` y `mocks.ts`: fixtures `loginUi`, `login` y `mockApi`                            | La prueba no hace `new` de nada                                       |
| 2.6 | `tests/ui/component/login/login.spec.ts` con C-03                                                     | Pasa: alerta "Sign in failed" con "Invalid email or password"         |
| 2.7 | Comprobar que la prueba detecta fallos: cambiar el mensaje del mock                                   | La prueba falla y el reporte incluye captura y traza                  |
| 2.8 | Completar la **Comparativa 1** (API-AUTH-01 frente a C-03) en `docs/comparisons.md`                   | Todos los criterios de la tabla tienen valor                          |

## Iteración 3 · Login correcto: API y e2e (M)

**Estado:** completada. Pruebas: API-AUTH-02 en `tests/api/component/auth/login.spec.ts`; E2E-00 y E2E-00b en `tests/ui/e2e/auth/operator-login.spec.ts`. Decisiones:

- La verificación previa (3.5) quedó como **dos proyectos de setup** (`api-health` y `web-health`) en lugar de un `globalSetup`: cada tipo de prueba depende solo del servicio que usa (las de UI · componente no exigen la API).
- La app guarda la sesión en **`sessionStorage`**, que `storageState()` no incluye. El setup `operator.auth.setup.ts` la lee con `page.evaluate` y la fixture `asOperator` la reinyecta con `page.addInitScript`.

**Objetivo:** el camino feliz en dos niveles y la primera prueba contra el sistema completo.

| #   | Tarea                                                                                                                            | Criterio de terminado                                                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 3.1 | API-AUTH-02: login del operador → 200, `tokenType: 'Bearer'`, `expiresIn: 900` y el JWT trae `role: 'operator'`                  | Pasa en `api-component`; el JWT se decodifica sin librerías externas                                       |
| 3.2 | Agregar el proyecto `ui-e2e` (`testDir: tests/ui/e2e`)                                                                           | `pnpm test:ui:e2e` ejecuta solo esa carpeta                                                             |
| 3.3 | `src/pages/operator/OperatorLocators.ts`: heading "Operations"                                                                   | Reutilizable por la prueba de recarga                                                                      |
| 3.4 | `tests/ui/e2e/auth/operator-login.spec.ts` (E2E-00): `login.signIn` del operador → URL `/operator` y heading "Operations"        | Pasa contra la API real                                                                                    |
| 3.5 | Comprobación previa en `globalSetup`: si la API o el frontend no responden, la ejecución falla con un mensaje claro              | Con la API apagada aparece "API not reachable at …"                                                        |
| 3.6 | Helper `loginAs(page, credentials)` y `tests/setup/auth.setup.ts`, que guarda `.auth/operator.json`; `ui-e2e` depende de `setup` | Una prueba que abre `/operator` con la sesión guardada pasa sin hacer login; `.auth/` está en `.gitignore` |
| 3.7 | Completar la **Comparativa 2** (API-AUTH-02 frente a E2E-00)                                                                     | Todos los criterios tienen valor                                                                           |

## Iteración 4 · Bloqueo de login: cuándo simular (S)

**Estado:** completada. API-AUTH-03 en `tests/api/component/auth/login.spec.ts` y C-04 en `tests/ui/component/login/login.spec.ts`; comparativa 3 en `comparisons.md`. C-04 usa `page.clock` (`install` + `pauseAt` + `runFor`) para que la cuenta regresiva sea determinista; esto adelanta parte del concepto `page.clock`, pendiente en el plan.

**Objetivo:** comparar un escenario costoso con la API real frente al mismo escenario simulado.

| #   | Tarea                                                                                                                          | Criterio de terminado                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| 4.1 | API-AUTH-03: 5 logins fallidos con un email único → el 6.º responde 429 `TOO_MANY_REQUESTS` con header `Retry-After` mayor a 0 | Pasa en `api-component`; el email único evita bloquear usuarios reales |
| 4.2 | `mockLogin.tooManyRequests(page, seconds)` con header `Retry-After`                                                            | El header llega a la app (la cuenta regresiva lo usa)                  |
| 4.3 | C-04: alerta "Too many login attempts", `1:15` y botón "Sign in" deshabilitado                                                 | Pasa en `ui-component`                                                 |
| 4.4 | Completar la **Comparativa 3** (API-AUTH-03 frente a C-04) y una conclusión sobre cuándo simular                               | La conclusión cabe en 3 líneas                                         |

## Iteración 5 · Registro (M)

**Estado:** completada. C-01 y C-02 en `tests/ui/component/register/register.spec.ts`; API-REG-01 y API-REG-02 en `tests/api/component/auth/register.spec.ts`. Los mensajes bajo cada campo se localizan con CSS por id (`#register-email-error`), el mismo id que el input referencia con `aria-describedby`. API-REG-02 también verifica que el email se compara sin distinguir mayúsculas (RN-25).

**Objetivo:** la primera funcionalidad completa en los tres niveles.

| #   | Tarea                                                                                                           | Criterio de terminado              |
| --- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 5.1 | `RegisterLocators.ts` y `RegisterActions.ts` (`goto`, `submit(name, email, password)`)                          | Siguen las mismas reglas que Login |
| 5.2 | C-01: formulario vacío → "Invalid name", "Invalid email" y "Password too short"                                 | Pasa sin mocks                     |
| 5.3 | `mockRegister.emailAlreadyRegistered(page)` y C-02                                                              | Pasa en `ui-component`             |
| 5.4 | `AuthApi.register(name, email, password)`                                                                       | Devuelve la `Response`             |
| 5.5 | API-REG-01 (registro → 201 con `role: customer`) y API-REG-02 (email repetido → 409 `EMAIL_ALREADY_REGISTERED`) | Pasan en `api-component`           |

## Iteración 6 · Cuentas (M)

**Estado:** completada. E2E-01 en `tests/ui/e2e/accounts/open-account.spec.ts` y API-ACC-01 en `tests/api/component/accounts/accounts.spec.ts`. Decisiones:

- **Actores** en `src/fixtures/actors.ts`: `customer` (registro y token por API), `customerSession` (además inicia sesión por la UI), `operatorClient` y los `AccountsApi` de cada uno. `base.ts` une las fixtures independientes y `actors.ts` se construye encima.
- `apiClient` crea su propio contexto con `playwright.request.newContext({ baseURL: API_URL })`: la fixture nativa `request` usa el `baseURL` del proyecto, que en los proyectos de UI es el frontend.
- El diálogo "Open an account" es un componente compartido (`src/pages/components/create-account-dialog`).
- E2E-01 verifica en la UI y confirma con la API que la cuenta existe con el mismo número.

**Objetivo:** primera e2e con datos preparados por API.

| #   | Tarea                                                                                                                 | Criterio de terminado                                 |
| --- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 6.1 | `AccountsApi.ts` (`create`, `list`, `getById`) con el token del cliente                                               | Probado indirectamente por 6.4 y 6.5                  |
| 6.2 | Fixture `customer`: crea el cliente por API e inicia sesión por la UI con `loginAs`                                   | La prueba recibe un cliente listo, con sesión         |
| 6.3 | `DashboardLocators.ts` (saldo, lista de cuentas, movimientos recientes) y `DashboardActions.ts` (`openAccount(type)`) | `openAccount` usa los Locators del diálogo compartido |
| 6.4 | E2E-01: abrir una cuenta de ahorros → toast, saldo `$0.00` y "No movements yet"                                       | Pasa en `ui-e2e`                                      |
| 6.5 | API-ACC-01: un operador que lista cuentas recibe 403 `FORBIDDEN`                                                      | Pasa en `api-component`                               |

## Iteración 7 · Recarga (M)

**Objetivo:** el flujo del operador completo.

| #   | Tarea                                                                                                  | Criterio de terminado                           |
| --- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| 7.1 | `OperatorLocators.ts` (completo) y `OperatorActions.ts` (`recharge(number, type, amount)`)             | Usa las opciones por rol y la etiqueta "Amount" |
| 7.2 | C-07: formulario vacío → tres mensajes de validación                                                   | Pasa sin mocks                                  |
| 7.3 | `mockRecharge.success(page)` y C-08: comprobante con `$1,500.00` y "View account"                      | Pasa en `ui-component`                          |
| 7.4 | `OperatorApi.ts` (`recharge`, con `Idempotency-Key` nueva en cada llamada) y helper `rechargeByApi`    | Lo usarán las iteraciones 8 y 10                |
| 7.5 | E2E-02: el operador recarga por la UI y el cliente ve el saldo y "Salary" (dos contextos de navegador) | Pasa en `ui-e2e`                                |
| 7.6 | API-RCH-01: efectivo por encima de $3,000.00 → 422 `CASH_LIMIT_EXCEEDED`                               | Pasa en `api-component`                         |

## Iteración 8 · Transferencia (M)

**Objetivo:** cubrir la regla de negocio más crítica.

| #   | Tarea                                                                                                                      | Criterio de terminado              |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 8.1 | `TransferLocators.ts`, `TransferActions.ts` y `ConfirmTransferDialog` (Locators y Actions)                                 | `review()` y `confirm()` separados |
| 8.2 | C-05: misma cuenta y monto vacío → mensajes y sin diálogo                                                                  | Pasa en `ui-component`             |
| 8.3 | `mockTransfer.insufficientFunds(page)` y C-06                                                                              | Pasa en `ui-component`             |
| 8.4 | Fixture `customerWithFunds` (cliente + dos cuentas + `rechargeByApi`)                                                      | Prepara datos sin pasar por la UI  |
| 8.5 | E2E-03: transferir $250.00 entre cuentas propias → toast, `$750.00` y "Transfer out"                                       | Pasa en `ui-e2e`                   |
| 8.6 | `TransfersApi.ts` y API-TRF-01: repetir con la misma `Idempotency-Key` → mismo cuerpo y header `Idempotent-Replayed: true` | Pasa en `api-component`            |

## Iteración 9 · Mocks desde OpenAPI (S)

**Objetivo:** que los mocks escritos a mano no se desalineen del contrato.

| #   | Tarea                                                                                           | Criterio de terminado                              |
| --- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 9.1 | Script `pnpm gen:mocks`: extrae los `examples` de `openapi.yaml` a `src/mocks/generated/`    | Genera un JSON por operación, estado y ejemplo     |
| 9.2 | Generar `src/mocks/api-types.ts` con `openapi-typescript`                                       | Compila sin errores                                |
| 9.3 | Reescribir los handlers para usar los archivos generados y `satisfies` con los tipos            | C-02, C-03, C-04, C-06 y C-08 siguen pasando       |
| 9.4 | Regla ESLint `no-restricted-imports` por carpeta (pages ↛ api, ui/component ↛ api, api ↛ pages) | Un import prohibido de prueba falla `pnpm lint` |

## Iteración 10 · API e2e, smoke y móvil (M)

| #    | Tarea                                                                                                                   | Criterio de terminado                  |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 10.1 | Proyecto `api-e2e` y API-E2E-01: registro → cuenta → recarga → transferencia → saldo igual a la suma de los movimientos | Pasa con `pnpm test:api`            |
| 10.2 | Tag `@smoke` en una prueba por tipo y script `test:smoke`                                                               | `pnpm test:smoke` ejecuta 4 pruebas |
| 10.3 | Proyecto `ui-e2e-mobile` (Pixel 7) para las e2e de UI                                                                   | E2E-00 a E2E-03 pasan en móvil         |

## Iteración 11 · Integración continua (M)

| #    | Tarea                                                                                  | Criterio de terminado                             |
| ---- | -------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 11.1 | Workflow de GitHub Actions que levanta PostgreSQL, la API y el frontend                | El job queda en verde con `test:smoke`            |
| 11.2 | Ejecutar `ui-component` y `api-component` en cada push, y las e2e en cada pull request | Los tiempos quedan visibles en el resumen del job |
| 11.3 | Publicar el reporte HTML y las trazas como artefactos                                  | Se descargan desde la ejecución fallida           |
| 11.4 | `retries: 2` en CI y sharding de las e2e                                               | Las e2e corren en 2 shards                        |

---

## Pruebas nuevas que introduce este plan

Complementan las de `minimum-tests.md`.

| ID          | Tipo             | Prueba                                                                                                |
| ----------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| API-AUTH-01 | API · componente | Login con credenciales inválidas → 401 `INVALID_CREDENTIALS`                                          |
| API-AUTH-02 | API · componente | Login del operador → 200, `Bearer`, `expiresIn: 900` y `role: operator` en el JWT                     |
| API-AUTH-03 | API · componente | 5 logins fallidos → el 6.º responde 429 con `Retry-After`                                             |
| E2E-00      | UI · e2e         | El operador del seed inicia sesión y llega a "Operations"                                             |
| API-REG-01  | API · componente | Registro → 201 con `role: customer`                                                                   |
| API-REG-02  | API · componente | Email repetido → 409 `EMAIL_ALREADY_REGISTERED`                                                       |
| API-ACC-01  | API · componente | El operador lista cuentas → 403 `FORBIDDEN`                                                           |
| API-RCH-01  | API · componente | Recarga en efectivo mayor a $3,000.00 → 422 `CASH_LIMIT_EXCEEDED`                                     |
| API-TRF-01  | API · componente | Transferencia repetida con la misma `Idempotency-Key` → respuesta igual y `Idempotent-Replayed: true` |
| API-E2E-01  | API · e2e        | Flujo completo de dinero: el saldo coincide con la suma de los movimientos                            |

---

## Plantilla de comparación

Se copia en `docs/comparisons.md` del proyecto de pruebas (tarea 0.7) y se completa al cerrar las iteraciones 2, 3 y 4.

| Comparativa | Escenario                   | Pruebas                     | Iteración |
| ----------- | --------------------------- | --------------------------- | --------- |
| 1           | Credenciales inválidas      | API-AUTH-01 frente a C-03   | 2         |
| 2           | Login correcto del operador | API-AUTH-02 frente a E2E-00 | 3         |
| 3           | Bloqueo tras 5 intentos     | API-AUTH-03 frente a C-04   | 4         |

```markdown
## Comparativa <n>: <escenario>

| Criterio                                                          | <prueba A> | <prueba B> |
| ----------------------------------------------------------------- | ---------- | ---------- |
| Tipo de prueba                                                    |            |            |
| Tiempo de ejecución (promedio de 5 ejecuciones)                   |            |            |
| Líneas de la prueba (sin contar fixtures)                         |            |            |
| Archivos que tuve que crear (Locators, Actions, mocks, clientes)  |            |            |
| ¿Necesita la API levantada?                                       |            |            |
| ¿Necesita el frontend levantado?                                  |            |            |
| ¿Deja estado en la base de datos?                                 |            |            |
| ¿Qué cambio la rompe? (mensaje, HTML, regla de negocio, contrato) |            |            |
| ¿Qué error detecta que la otra no?                                |            |            |
| ¿Es estable al repetirla 10 veces?                                |            |            |

**Conclusión** (2 o 3 líneas): ¿cuándo elegiría cada una para este tipo de escenario?
```

Cómo medir:

- **Tiempo:** `pnpm exec playwright test <archivo> --repeat-each=5 --reporter=list` y promediar las duraciones.
- **Estabilidad:** `--repeat-each=10` sin fallos.
- **Qué la rompe:** cambiar a propósito un mensaje del mock, un label del HTML o el mensaje esperado y ver cuál falla.
