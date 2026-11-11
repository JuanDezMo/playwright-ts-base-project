# Plan del proyecto de pruebas con Playwright

Proyecto **independiente** (`playwright_base_project`, repositorio aparte del frontend `banking_frontend_lab`) que prueba la web Banking Test Lab y la API Go. Este documento define la arquitectura, los tipos de prueba y su organización. Las pruebas mínimas iniciales están en [minimum-tests.md](minimum-tests.md).

## 1. Objetivos

- Practicar todos los conceptos de Playwright: localizadores, fixtures, `storageState`, `page.route`, API testing, proyectos, tags, reportes y CI.
- Mantener una arquitectura sencilla, escalable y alineada con SOLID.
- Separar claramente las pruebas de **UI** y de **API**, y dentro de cada una las de **componente** y las **e2e**.

## 2. Tipos de prueba

| Tipo             | Qué prueba                                    | Navegador | Backend                 | Herramienta                  |
| ---------------- | --------------------------------------------- | --------- | ----------------------- | ---------------------------- |
| UI · componente  | Una pantalla y sus estados                    | Sí        | Simulado (`page.route`) | Page Objects + mocks         |
| UI · e2e         | Un flujo de usuario completo                  | Sí        | API real                | Page Objects + datos por API |
| API · componente | Un endpoint aislado: estado, cuerpo, contrato | No        | API real                | Clientes de API (`request`)  |
| API · e2e        | Un flujo de negocio entre varios endpoints    | No        | API real                | Clientes de API (`request`)  |

"Componente" significa aquí **pantalla con la API simulada**, no Playwright Component Testing (`@playwright/experimental-ct-react`). Esa modalidad necesita el código fuente de React, así que solo serviría dentro del repo del frontend, y además es experimental.

## 3. Arquitectura

Cuatro capas con una única dirección de dependencia:

```
tests  →  fixtures  →  pages (Actions → Locators) / api / mocks  →  config
```

- Las pruebas **describen el escenario y verifican**. No crean objetos ni usan `page.locator` para operar.
- Las **fixtures** preparan datos, sesiones y Page Objects, y los inyectan.
- Los **Page Objects** se dividen en **Locators** (qué hay en la pantalla) y **Actions** (cómo se opera).
- Los **clientes de API** sirven para dos cosas: preparar datos en las pruebas de UI y verificar en las de API.

### Estructura de carpetas

```
playwright_base_project/
├─ playwright.config.ts            # proyectos por tipo de prueba (sección 7)
├─ package.json                    # scripts: test, test:api… (se suman por iteración)
├─ src/
│  ├─ config/
│  │  └─ env.ts                    # BASE_URL, API_URL, credenciales del seed, límites
│  ├─ api/                         # clientes de la API (uno por recurso)
│  │  ├─ ApiClient.ts              # request base: token, Idempotency-Key
│  │  ├─ AuthApi.ts                # register, login, refresh, logout
│  │  ├─ AccountsApi.ts            # create, list, getById, movements
│  │  ├─ TransfersApi.ts           # create
│  │  └─ OperatorApi.ts            # recharge
│  ├─ pages/                       # un directorio por pantalla
│  │  ├─ login/
│  │  │  ├─ LoginLocators.ts
│  │  │  └─ LoginActions.ts
│  │  ├─ register/
│  │  ├─ dashboard/
│  │  ├─ account-detail/
│  │  ├─ transfer/
│  │  ├─ operator/
│  │  └─ components/               # piezas compartidas: AppNav, ConfirmTransferDialog, ErrorAlert
│  ├─ mocks/                       # solo para UI · componente
│  │  ├─ generated/                # generado desde openapi.yaml (no se edita a mano)
│  │  ├─ api-types.ts              # generado con openapi-typescript
│  │  ├─ payloads.ts               # datos coherentes escritos a mano (cuentas, movimientos)
│  │  └─ handlers.ts               # page.route: une archivo + ruta + headers
│  ├─ fixtures/
│  │  ├─ base.ts                   # datos únicos, credenciales
│  │  ├─ ui.ts                     # Locators/Actions de cada pantalla
│  │  ├─ mocks.ts                  # mockApi listo para usar
│  │  ├─ api.ts                    # clientes de API con token
│  │  └─ index.ts                  # combina y exporta test / expect
│  └─ data/
│     └─ factories.ts              # uniqueEmail(), cuentas, montos
├─ tests/                          # sección 6
└─ .auth/                          # storageState por rol (en .gitignore)
```

### Responsabilidad de cada capa

| Capa                | Carpeta                    | Responsabilidad                                                                                             | Puede                                                                                                | No puede                                                                                                                                 |
| ------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Pruebas**         | `tests/`                   | Describir el escenario (preparar, actuar, verificar) y hacer las aserciones de negocio                      | Pedir fixtures por parámetro; usar Actions para operar y Locators o respuestas de API para verificar | Instanciar Page Objects o clientes de API; usar `page.locator` o `request` directamente para operar; depender del orden de otras pruebas |
| **Fixtures**        | `src/fixtures/`            | Construir e inyectar dependencias: Page Objects, clientes de API, mocks, datos y sesiones; limpiar al final | Usar todas las capas inferiores y otras fixtures                                                     | Contener aserciones de negocio o lógica de un escenario concreto                                                                         |
| **Actions**         | `src/pages/*/…Actions.ts`  | Encapsular cómo se opera una pantalla (navegar, llenar, confirmar)                                          | Usar sus Locators y las Actions de componentes compartidos                                           | Hacer aserciones de negocio; usar clientes de API; conocer otras pantallas (salvo componentes compartidos)                               |
| **Locators**        | `src/pages/*/…Locators.ts` | Declarar qué elementos tiene una pantalla y cómo se encuentran                                              | Usar `page` (`getByRole`, `getByLabel`, `getByTestId`…)                                              | Hacer clics, escribir o esperar flujos; contener aserciones                                                                              |
| **Clientes de API** | `src/api/`                 | Hablar con la API: construir peticiones, token, `Idempotency-Key` y devolver la respuesta                   | Usar `request` y `config`                                                                            | Hacer aserciones (devuelven la respuesta y la prueba decide); usar Page Objects                                                          |
| **Mocks**           | `src/mocks/`               | Definir respuestas simuladas (`page.route`) a partir de archivos generados y datos propios                  | Usar `page`, `generated/` y `api-types.ts`                                                           | Llamar a la API real; contener aserciones                                                                                                |
| **Datos**           | `src/data/`                | Fabricar datos únicos y válidos (emails, montos, tipos de cuenta)                                           | Usar `config`                                                                                        | Llamar a la API o al navegador                                                                                                           |
| **Configuración**   | `src/config/`              | URLs, credenciales del seed, límites de negocio                                                             | —                                                                                                    | Depender de ninguna otra capa                                                                                                            |

### Comunicación entre capas

La dependencia va **siempre hacia abajo**; ninguna capa importa una superior:

```
tests ──► fixtures ──┬──► Actions ──► Locators ──► page
                     ├──► clientes de API ───────► request
                     ├──► mocks ─────────────────► page.route
                     └──► data / config
```

- Las **pruebas** solo reciben objetos ya construidos por las fixtures (inyección de dependencias).
- Las **fixtures** son el único lugar donde se crean instancias y se conectan las capas.
- Las **Actions** reciben sus **Locators** en el constructor, así que se puede cambiar la estrategia de localización sin tocarlas.
- Los **clientes de API** y los **mocks** no se conocen entre sí: unos van al servidor real y otros lo reemplazan.
- Los resultados suben como valores de retorno (por ejemplo `customer`, `Response` o `Locator`) y la prueba es quien verifica.

Flujo en cada tipo de prueba:

| Tipo             | Preparar                                                                       | Actuar                             | Verificar                                                           |
| ---------------- | ------------------------------------------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------- |
| UI · componente  | Fixture `mockApi` → `page.route`                                               | Actions de la pantalla             | Locators (`expect(ui.errorAlert).toHaveText(…)`)                    |
| UI · e2e         | Fixtures de datos → clientes de API (crear cliente, recargar) → `storageState` | Actions de varias pantallas        | Locators y, si hace falta, clientes de API para confirmar el estado |
| API · componente | Fixtures de datos y token                                                      | Un cliente de API                  | Estado, cuerpo y headers de la `Response`                           |
| API · e2e        | Fixtures de datos y token                                                      | Varios clientes de API encadenados | Respuestas y reglas de negocio (saldo = suma de movimientos)        |

Ejemplo de comunicación en una prueba de UI · e2e:

```ts
test('E2E-03 transfer between own accounts', async ({
  customerWithFunds,
  transfer,
  transferUi,
  accountsApi,
}) => {
  // 1. Preparar: la fixture ya creó al cliente, recargó por API e inició sesión
  // 2. Actuar: la prueba usa Actions; las Actions usan sus Locators
  await transfer.goto()
  await transfer.review(customerWithFunds.accounts.checking.number, '250')
  // 3. Verificar en la UI con Locators…
  await expect(transferUi.successToast).toHaveText('Transfer of $250.00 completed')
  // …y confirmar el estado real con un cliente de API
  const checking = await accountsApi.getById(customerWithFunds.accounts.checking.id)
  expect(checking.balance).toBe(25000)
})
```

La regla de dependencia se verifica con ESLint (`no-restricted-imports` por carpeta). Por ejemplo, `src/pages` no puede importar `src/api`, y `tests/ui/component` no puede importar `src/api`.

### Locators y Actions separados

```ts
// src/pages/transfer/TransferLocators.ts: si cambia el HTML, solo cambia este archivo
export class TransferLocators {
  constructor(private readonly page: Page) {}
  readonly destination = this.page.getByLabel('To account number')
  readonly amount = this.page.getByLabel('Amount')
  readonly reviewButton = this.page.getByRole('button', { name: 'Review transfer' })
  readonly destinationChip = (number: string) => this.page.getByTestId(`destination-chip-${number}`)
  readonly successToast = this.page.getByText(/Transfer of .* completed/)
}

// src/pages/transfer/TransferActions.ts: si cambia el flujo, solo cambia este archivo
export class TransferActions {
  constructor(
    private readonly page: Page,
    private readonly ui: TransferLocators,
  ) {}
  async goto() {
    await this.page.goto('/transfer')
  }
  async review(destination: string, amount: string) {
    await this.ui.destination.fill(destination)
    await this.ui.amount.fill(amount)
    await this.ui.reviewButton.click()
  }
}
```

Las pruebas usan **Actions para operar** y **Locators para verificar**. Para practicar estrategias de localización se pueden crear variantes con el mismo contrato (`TransferLocatorsByRole`, `ByTestId`, `ByXPath`); las Actions funcionan igual con cualquiera.

Los componentes muy pequeños (por ejemplo, el selector de tema) pueden tener solo Locators.

## 4. Fixtures

Una fixture es una dependencia que Playwright prepara **antes** de la prueba, entrega por parámetro y limpia **después**. Solo se ejecutan las que la prueba pide.

**Sin fixtures**, cada prueba registra al cliente, abre cuentas, recarga, inicia sesión y crea sus Page Objects (unas 15 líneas, de las que solo 3 son el escenario). **Con fixtures**, la prueba pide lo que necesita:

```ts
// src/fixtures/ui.ts
export const test = base.extend<UiFixtures>({
  transferUi: async ({ page }, use) => {
    await use(new TransferLocators(page))
  },
  transfer: async ({ page, transferUi }, use) => {
    await use(new TransferActions(page, transferUi))
  },
  customerWithFunds: async ({ request, page }, use) => {
    const customer = await new AuthApi(request).registerUnique() // antes
    customer.accounts = await new AccountsApi(request, customer).open(['savings', 'checking'])
    await new OperatorApi(request).recharge(customer.accounts.savings.number, 1000)
    await loginAs(page, customer)
    await use(customer) // la prueba
    // después: limpieza si hiciera falta
  },
})

// tests/ui/e2e/transfers/own-accounts.spec.ts
test('E2E-03 transfer between own accounts', async ({ customerWithFunds, transfer, page }) => {
  await transfer.goto()
  await transfer.review(customerWithFunds.accounts.checking.number, '250')
  await expect(page.getByText('Transfer of $250.00 completed')).toBeVisible()
})
```

| Aspecto           | Sin fixtures            | Con fixtures                   |
| ----------------- | ----------------------- | ------------------------------ |
| Líneas por prueba | ~15                     | ~4                             |
| Datos y login     | Copiados en cada prueba | En un solo lugar               |
| Limpieza          | Manual (`afterEach`)    | Automática, después de `use()` |
| Ejecución         | Todo el `beforeEach`    | Solo lo que la prueba pide     |

Alcance: por defecto `scope: 'test'`. Lo costoso y compartible (por ejemplo, el token del operador) usa `scope: 'worker'`.

## 5. Mocks de la API (UI · componente)

Se usa **`page.route()`, nativo de Playwright**, sin librerías de terceros. MSW requeriría registrar un service worker dentro del frontend y acoplaría ambos repos.

| Necesidad                         | API de Playwright                                                 |
| --------------------------------- | ----------------------------------------------------------------- |
| Responder con un estado y un JSON | `route.fulfill({ status, json, headers })`                        |
| Dejar pasar al servidor           | `route.continue()`                                                |
| Modificar la respuesta real       | `route.fetch()` y luego `route.fulfill({ response, json })`       |
| Fallo de red                      | `route.abort('failed')`                                           |
| Lentitud (estados de carga)       | Esperar antes de `fulfill`                                        |
| Verificar lo que envió la app     | `route.request().postDataJSON()` y `headers()['idempotency-key']` |

### Generación desde `openapi.yaml`

El contrato ya define ejemplos con nombre para cada respuesta (`insufficientFunds`, `cashLimitExceeded`, `invalidEmail`…).

| Paso                   | Herramienta                                 | Resultado                                                                   |
| ---------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| Extraer los `examples` | Script propio (~40 líneas, librería `yaml`) | `src/mocks/generated/<operación>/<estado>.<ejemplo>.json`                   |
| Respuestas sin ejemplo | `openapi-sampler` (opcional)                | Cuerpo válido a partir del schema                                           |
| Tipos del contrato     | `openapi-typescript`                        | `src/mocks/api-types.ts`: los mocks dejan de compilar si el contrato cambia |

```ts
// src/mocks/handlers.ts
import insufficientFunds from './generated/transfer/422.insufficientFunds.json'
export const mockTransfer = {
  insufficientFunds: (page: Page) =>
    page.route('**/api/transfers', (route) =>
      route.fulfill({ status: 422, json: insufficientFunds satisfies ApiError }),
    ),
}
```

Queda escrito a mano en `handlers.ts` y `payloads.ts`:

- headers como `Retry-After` e `Idempotent-Replayed`;
- escenarios con estado, como "409 y luego 201";
- datos coherentes entre llamadas.

## 6. Organización de las pruebas

Primero se separa por **interfaz** (UI o API); dentro de cada una, por **nivel** (componente o e2e); y dentro de cada nivel, por **funcionalidad**.

```
tests/
├─ setup/
│  └─ auth.setup.ts                      # login por rol → .auth/customer.json, .auth/operator.json
├─ ui/
│  ├─ component/                         # pantalla + API simulada (sin backend)
│  │  ├─ register/register.spec.ts       # C-01, C-02
│  │  ├─ login/login.spec.ts             # C-03, C-04
│  │  ├─ transfer/transfer.spec.ts       # C-05, C-06
│  │  └─ recharge/recharge.spec.ts       # C-07, C-08
│  └─ e2e/                               # navegador + API real
│     ├─ accounts/open-account.spec.ts   # E2E-01
│     ├─ recharge/recharge-flow.spec.ts  # E2E-02
│     └─ transfers/own-accounts.spec.ts  # E2E-03
└─ api/
   ├─ component/                         # un endpoint aislado
   │  ├─ auth/register.spec.ts           # 201, 400 por campo, 409
   │  ├─ auth/login.spec.ts              # 200, 401, 429 + Retry-After
   │  ├─ accounts/accounts.spec.ts       # crear, listar, 403 para operador, 404 de cuenta ajena
   │  ├─ transfers/transfers.spec.ts     # 201, 422 fondos insuficientes, idempotencia (replay)
   │  └─ recharge/recharge.spec.ts       # 201, 422 tope de efectivo, 403 para cliente
   └─ e2e/                               # flujo de negocio entre varios endpoints
      ├─ customer-lifecycle.spec.ts      # register → login → cuenta → recarga → movimientos
      └─ money-flow.spec.ts              # recarga → transferencia → saldos y movimientos de ambas cuentas
```

### Qué va en cada nivel

| Nivel          | UI                                                                          | API                                                                                                  |
| -------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Componente** | Una pantalla, una respuesta simulada; verifica textos, estados y navegación | Un endpoint; verifica estado, cuerpo `{ code, message }`, headers y contrato                         |
| **E2E**        | Un recorrido del usuario por varias pantallas, con datos preparados por API | Varios endpoints encadenados; verifica reglas de negocio (saldo = suma de movimientos, idempotencia) |

### Proyectos en `playwright.config.ts`

```ts
export default defineConfig({
  reporter: [['html'], ['list']],
  use: { trace: 'on-first-retry', screenshot: 'only-on-failure' },
  projects: [
    { name: 'setup', testDir: 'tests/setup' },
    {
      name: 'ui-component',
      testDir: 'tests/ui/component',
      use: { ...devices['Desktop Chrome'], baseURL: env.BASE_URL },
    },
    {
      name: 'ui-e2e',
      testDir: 'tests/ui/e2e',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], baseURL: env.BASE_URL },
    },
    {
      name: 'ui-e2e-mobile',
      testDir: 'tests/ui/e2e',
      dependencies: ['setup'],
      use: { ...devices['Pixel 7'], baseURL: env.BASE_URL },
    },
    { name: 'api-component', testDir: 'tests/api/component', use: { baseURL: env.API_URL } },
    { name: 'api-e2e', testDir: 'tests/api/e2e', use: { baseURL: env.API_URL } },
  ],
})
```

### Scripts

| Script                      | Ejecuta                                                              |
| --------------------------- | -------------------------------------------------------------------- |
| `pnpm test`                  | Todo                                                                 |
| `pnpm test:ui`           | `--project=ui-component --project=ui-e2e`                            |
| `pnpm test:ui:component` | `--project=ui-component` (no necesita backend)                       |
| `pnpm test:ui:e2e`       | `--project=ui-e2e`                                                   |
| `pnpm test:api`          | `--project=api-component --project=api-e2e`                          |
| `pnpm test:smoke`        | `--grep @smoke` (una prueba crítica por tipo)                        |
| `pnpm gen:mocks`         | Regenera `src/mocks/generated` y `api-types.ts` desde `openapi.yaml` |

### Convenciones

- Nombre de la prueba con su ID: `test('C-06 shows insufficient funds', …)`.
- Tags en el título o en `tag`: `@smoke`, `@regression` y el área (`@transfers`, `@auth`).
- Cada prueba crea sus propios datos (email único) y no depende del orden. Así se pueden correr en paralelo.
- Las pruebas de UI · componente **no** importan clientes de API, y las de API **no** importan Page Objects. Una regla de ESLint (`no-restricted-imports` por carpeta) lo hace cumplir.

## 7. SOLID en el proyecto de pruebas

| Principio | Aplicación                                                                                                                             |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **S**     | Locators (HTML), Actions (flujo), clientes de API (un recurso cada uno), pruebas (escenario y verificación)                            |
| **O**     | Una pantalla, un tipo de prueba o un navegador nuevo se agregan como archivos, fixtures o proyectos nuevos, sin modificar lo existente |
| **L**     | Variantes de Locators con el mismo contrato; `DataSetup` por API o por UI intercambiables                                              |
| **I**     | Fixtures separadas por tipo (`ui`, `api`, `mocks`): una prueba de API nunca abre un navegador                                          |
| **D**     | Las pruebas reciben sus dependencias de las fixtures; la configuración y los datos cambian en un solo lugar                            |

## 8. Datos de prueba

| Dato     | Estrategia                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------- |
| Operador | Seed de la API: `operator@bank.local` / `Operator2026!`                                               |
| Clientes | Creados por API en cada prueba con email único (`ana+<timestamp>-<worker>@mail.com`)                  |
| Saldo    | `OperatorApi.recharge` (máximo 5 recargas y $3,000,000.00 por cuenta y día; efectivo hasta $3,000.00) |
| Sesiones | `storageState` por rol desde `tests/setup` para las e2e de UI                                         |

## 9. Iteraciones propuestas

El plan detallado, con tareas y criterios de terminado, está en [playwright-iterations.md](playwright-iterations.md). Resumen inicial:

| #   | Entregable                                                                                          |
| --- | --------------------------------------------------------------------------------------------------- |
| 1   | Proyecto base: config, `env.ts`, `ApiClient`, `AuthApi`, fixtures base, reporte HTML                |
| 2   | API · componente: auth, cuentas, transferencias y recarga                                           |
| 3   | Generación de mocks desde `openapi.yaml` y UI · componente C-01 a C-08                              |
| 4   | Page Objects completos (Locators + Actions), `storageState` y UI · e2e E2E-01 a E2E-03              |
| 5   | API · e2e (ciclo de vida del cliente, flujo de dinero)                                              |
| 6   | Proyecto móvil, tags `@smoke`, variantes de localizadores, accesibilidad con `@axe-core/playwright` |
| 7   | CI (GitHub Actions): levantar API + frontend, sharding, artefactos de traza y reporte               |
