# Pruebas mínimas propuestas

Conjunto inicial y sencillo para el futuro proyecto de Playwright (repositorio aparte). Todas se validan a nivel de la UI: textos visibles, estados de controles y navegación.

- **Pruebas de componente (C-01 a C-08):** una pantalla, una sola respuesta de la API simulada (`page.route`). No necesitan el backend.
- **Pruebas e2e (E2E-01 a E2E-03):** frontend + API Go real, reutilizando el login y la recarga.

## Datos y utilidades comunes

Nombres propuestos originalmente; en el proyecto quedaron como fixtures: `createCustomer` → `customer`, `loginAs` → `LoginActions.loginAs` y `customerSession`, `rechargeByApi` → `operatorApi.recharge`.

| Recurso                                         | Uso                                                                                                                                                   |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operador                                        | `operator@bank.local` / `Operator2026!` (seed de la API)                                                                                              |
| Cliente                                         | Email único por prueba (`ana+<timestamp>@mail.com`), contraseña `Lab2026pass`                                                                         |
| Montos                                          | Se escriben en dólares (`1500`); la API los recibe en centavos (`150000`)                                                                             |
| `loginAs(page, email, password)`                | Login por la UI: llena "Email" y "Password", pulsa "Sign in" y espera la URL del rol (`/accounts` u `/operator`). Base para un `storageState` por rol |
| `createCustomer(request)`                       | `POST /auth/register` por API; devuelve email y contraseña                                                                                            |
| `rechargeByApi(request, accountNumber, amount)` | Login de operador por API + `POST /recharge` con `Idempotency-Key` nueva. Prepara saldo sin pasar por la UI                                           |

## Pruebas de componente

| ID   | Pantalla                  | Prueba                     | Respuesta simulada                                                          | Pasos                                                                                    | Resultado esperado en la UI                                                                            |
| ---- | ------------------------- | -------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| C-01 | Registro `/register`      | Validación de campos       | Ninguna                                                                     | Pulsar "Create account" con el formulario vacío                                          | Se ven "Invalid name", "Invalid email" y "Password too short"; los campos tienen `aria-invalid="true"` |
| C-02 | Registro `/register`      | Email ya registrado        | `POST /auth/register` → 409 `EMAIL_ALREADY_REGISTERED`                      | Llenar nombre, email y contraseña válidos y pulsar "Create account"                      | La alerta "Registration failed" muestra "Email already registered"                                     |
| C-03 | Login `/login`            | Credenciales inválidas     | `POST /auth/login` → 401 `INVALID_CREDENTIALS`                              | Llenar email y contraseña y pulsar "Sign in"                                             | La alerta "Sign in failed" muestra "Invalid email or password"                                         |
| C-04 | Login `/login`            | Bloqueo por intentos       | `POST /auth/login` → 429 `TOO_MANY_REQUESTS` con `Retry-After: 75`          | Llenar email y contraseña y pulsar "Sign in"                                             | La alerta "Too many login attempts" muestra `1:15` y el botón "Sign in" está deshabilitado             |
| C-05 | Transferencia `/transfer` | Misma cuenta y monto vacío | `GET /accounts` → una cuenta                                                | Escribir en "To account number" el número de la cuenta origen y pulsar "Review transfer" | Se ven "Cannot transfer to the same account" y "Enter an amount"; no se abre el diálogo                |
| C-06 | Transferencia `/transfer` | Fondos insuficientes       | `GET /accounts` → dos cuentas; `POST /transfers` → 422 `INSUFFICIENT_FUNDS` | Elegir destino, escribir monto, "Review transfer" → "Confirm transfer"                   | En el diálogo se ve "Insufficient funds" y el botón cambia a "Try again"                               |
| C-07 | Recarga `/operator`       | Validación de campos       | Ninguna (sesión de operador)                                                | Pulsar "Recharge account" con el formulario vacío                                        | Se ven "Invalid account number", "Choose a recharge type" y "Enter an amount"                          |
| C-08 | Recarga `/operator`       | Recarga exitosa            | `POST /recharge` → 201 con el movimiento                                    | Número de cuenta válido, tipo "Salary", monto `1500`, pulsar "Recharge account"          | Se ve "Recharge completed", el monto `$1,500.00` y el enlace "View account"                            |

C-01, C-05 y C-07 solo validan en el navegador. Las pantallas protegidas (C-05 a C-08) necesitan una sesión: se inyecta en `sessionStorage` (`btl-session`) o se usa el `storageState` del rol.

## Pruebas e2e

| ID     | Flujo                                         | Reutiliza                                        | Pasos                                                                                                                                                                                                                                                  | Resultado esperado en la UI                                                                                                                                                           |
| ------ | --------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E2E-01 | Cliente abre su primera cuenta                | `createCustomer` + `loginAs`                     | 1. Crear cliente por API. 2. `loginAs` como cliente. 3. Pulsar "Open account", elegir "Savings" y pulsar "Open account" en el diálogo                                                                                                                  | Toast "Savings account opened"; el bloque principal muestra un saldo de `$0.00` y un número de 10 dígitos; "Recent movements" muestra "No movements yet"                              |
| E2E-02 | El operador recarga y el cliente ve el dinero | E2E-01 (cliente con cuenta) + `loginAs` operador | 1. Copiar el número de cuenta del cliente. 2. `loginAs` como operador. 3. Recargar `1500` como "Salary". 4. Cerrar sesión y `loginAs` como cliente                                                                                                     | El operador ve "Recharge completed" con `$1,500.00`. El cliente ve un saldo de `$1,500.00` y el movimiento "Salary" en "Recent movements"                                             |
| E2E-03 | Transferencia entre cuentas propias           | `createCustomer` + `rechargeByApi` + `loginAs`   | 1. Crear cliente y dos cuentas (ahorros y corriente) por API. 2. `rechargeByApi` de `1000` a la de ahorros. 3. `loginAs` como cliente. 4. "Transfer": destino con el botón de la cuenta corriente, monto `250`, "Review transfer" → "Confirm transfer" | Toast "Transfer of $250.00 completed"; el detalle de la cuenta de ahorros muestra `$750.00` y un "Transfer out" de `-$250.00`; en el dashboard, la cuenta corriente muestra `$250.00` |

## Localizadores sugeridos

Prioridad: rol, label y texto; `data-testid` solo para elementos dinámicos.

| Elemento             | Localizador                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| Campos de formulario | `getByLabel('Email')`, `getByLabel('Amount')`, `getByLabel('To account number')`                       |
| Botones              | `getByRole('button', { name: 'Review transfer' })`, `getByRole('radio', { name: /Salary/ })`           |
| Alertas de error     | `getByRole('alert').filter({ hasText: 'Insufficient funds' })` o `getByTestId('transfer-error-alert')` |
| Saldo seleccionado   | `getByTestId('selected-account-balance')` (su atributo `value` tiene los centavos exactos)             |
| Cuenta en la lista   | `getByTestId('account-row-<numero>')`                                                                  |
| Movimiento           | `getByTestId('movement-list').getByText('Salary')`                                                     |
