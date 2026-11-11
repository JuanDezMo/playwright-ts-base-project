# Comparativas entre niveles de prueba

El mismo escenario del login se prueba en distintos niveles para aprender qué valida cada tipo de prueba, cuánto cuesta y cuándo conviene. Se completa al cerrar las iteraciones 2, 3 y 4 de [playwright-iterations.md](playwright-iterations.md).

Cómo medir:

- **Tiempo:** `pnpm exec playwright test <archivo> --repeat-each=5 --workers=1 --reporter=list` y promediar la duración de cada prueba (no el total de la ejecución, que suma el arranque). Con `--reporter=json` se obtienen los valores exactos en `results[].duration`.
- **Estabilidad:** `--repeat-each=10` sin fallos.
- **Qué la rompe:** cambiar a propósito un mensaje del mock, un label del HTML o el mensaje esperado y ver cuál falla.

## Comparativa 1: credenciales inválidas

Completada en la iteración 2 (medido el 2026-11-10, Chromium 158, en local).

| Criterio | API-AUTH-01 (API · componente) | C-03 (UI · componente) |
| --- | --- | --- |
| Tipo de prueba | Petición HTTP directa a `POST /auth/login` | Pantalla de login real con `POST /api/auth/login` simulado (`page.route`) |
| Tiempo de ejecución (promedio de 5 ejecuciones) | **98 ms** (79–108) | **990 ms** (951–1025), unas 10 veces más |
| Líneas de la prueba (sin contar fixtures) | 12 | 11 |
| Archivos que tuve que crear | 3: `ApiClient`, `AuthApi`, `fixtures/api.ts` (más `data/factories.ts`, compartido) | 6: `LoginLocators`, `LoginActions`, `pages/login/index`, `mocks/handlers`, `fixtures/ui.ts`, `fixtures/mocks.ts` |
| ¿Necesita la API levantada? | Sí | No |
| ¿Necesita el frontend levantado? | No | Sí |
| ¿Deja estado en la base de datos? | Sí, mínimo: registra un intento fallido para un email que no existe (RN-29) | No |
| ¿Qué cambio la rompe? | Cambiar en el backend el estado, el `code` o el `message` | Cambiar el label "Email"/"Password", el botón "Sign in", el `data-testid` de la alerta o cómo el frontend muestra el error. Un cambio del backend **no** la rompe (el mock responde igual) |
| ¿Qué error detecta que la otra no? | Que la API real valide mal o cambie el contrato | Que el formulario no envíe, que la alerta no se muestre o que el frontend llame a otra ruta |
| ¿Es estable al repetirla 10 veces? | Sí (10/10) | Sí (10/10) |

**Conclusión:** la de API es unas 10 veces más rápida, solo necesita el backend y protege el **contrato**. La de UI con mock no necesita el backend y protege **cómo se muestra el error**, pero no detectaría un cambio del backend. Se complementan: la API asegura la regla y la UI asegura que el usuario la ve.

## Comparativa 2: login correcto del operador

Completada en la iteración 3 (medido el 2026-11-10, Chromium 158, en local).

| Criterio | API-AUTH-02 (API · componente) | E2E-00 (UI · e2e) |
| --- | --- | --- |
| Tipo de prueba | `POST /auth/login` directo y lectura del JWT | Login real en el navegador: frontend, proxy `/api` y API Go |
| Tiempo de ejecución (promedio de 5 ejecuciones) | **84 ms** (78–89) | **1047 ms** (998–1144), unas 12 veces más |
| Líneas de la prueba (sin contar fixtures) | 11 | 6 |
| Archivos que tuve que crear | 1: `api/jwt.ts` (reutiliza `AuthApi`) | 2: `OperatorLocators` y `pages/operator/index`; además `loginAs` en `LoginActions` y los setups de verificación previa |
| ¿Necesita la API levantada? | Sí | Sí |
| ¿Necesita el frontend levantado? | No | Sí |
| ¿Deja estado en la base de datos? | Sí: un refresh token nuevo por login | Sí: un refresh token nuevo por login |
| ¿Qué cambio la rompe? | Cambiar `tokenType`, `expiresIn`, el claim `role` o la duración del token | Cambiar los labels del login, el heading "Operations", la ruta `/operator`, la redirección por rol o cómo se guarda la sesión |
| ¿Qué error detecta que la otra no? | Que el token dure otra cosa que 900 s o lleve un rol incorrecto, aunque la UI funcione | Que el frontend no guarde la sesión, no lea el rol del token o no redirija; también un proxy `/api` mal configurado |
| ¿Es estable al repetirla 10 veces? | Sí (10/10) | Sí (10/10) |

**Conclusión:** la e2e tiene menos líneas porque las fixtures y Actions hacen el trabajo, pero es unas 12 veces más lenta y depende de todo el sistema. La de API verifica **el detalle de los datos** (claims, duración), que la e2e no ve. La e2e verifica **la integración**: que las piezas funcionan juntas. Conviene pocas e2e para los caminos críticos y muchas de API para los detalles.

## Comparativa 3: bloqueo tras 5 intentos

Completada en la iteración 4 (medido el 2026-11-10, Chromium 158, en local).

| Criterio | API-AUTH-03 (API · componente, API real) | C-04 (UI · componente, 429 simulado) |
| --- | --- | --- |
| Tipo de prueba | 6 llamadas reales a `POST /auth/login` con el mismo email | Pantalla de login con un 429 simulado y el reloj del navegador pausado (`page.clock`) |
| Tiempo de ejecución (promedio de 5 ejecuciones) | **268 ms** (248–321): 6 peticiones | **993 ms** (985–1002) |
| Líneas de la prueba (sin contar fixtures) | 17 | 16 |
| Archivos que tuve que crear | Ninguno: reutiliza `AuthApi` y `uniqueEmail` | Ninguno nuevo: un handler (`tooManyRequests`) y dos localizadores (`lockoutAlert`, `lockoutCountdown`) |
| ¿Necesita la API levantada? | Sí | No |
| ¿Necesita el frontend levantado? | No | Sí |
| ¿Deja estado en la base de datos? | **Sí**: 5 intentos fallidos y el email bloqueado 15 minutos. Por eso usa un email único | No |
| ¿Qué cambio la rompe? | Cambiar el límite de intentos, la ventana, el estado 429, el cuerpo o el header `Retry-After` | Cambiar el texto de la alerta, el formato de la cuenta regresiva, el `role="timer"` o que el botón deje de deshabilitarse |
| ¿Qué error detecta que la otra no? | Que el backend cuente mal los intentos o no envíe `Retry-After`: la **regla de negocio real** | Que la UI ignore `Retry-After`, no muestre la cuenta regresiva, no la haga avanzar o deje el botón activo |
| ¿Es estable al repetirla 10 veces? | Sí (10/10), gracias al email único | Sí (10/10), solo después de pausar el reloj (ver nota) |

**Conclusión:** provocar el bloqueo de verdad es posible y rápido por API, pero **deja estado** (un email bloqueado 15 minutos) y obliga a aislar datos. Para la UI conviene **simular**: el mock da el 429 al instante y `page.clock` controla el tiempo, sin depender del backend ni de esperas reales. Regla práctica: la regla de negocio se prueba con la API real; la reacción de la pantalla, con un mock.

**Nota sobre `page.clock`:** `clock.install()` solo falsea el reloj; el tiempo **sigue corriendo** a velocidad real. La primera versión de C-04 usaba `runFor(5000)` y tardaba 5,4 s, porque cada tick de la cuenta regresiva programa el siguiente después de renderizar: `runFor` disparó un tick y los otros cuatro llegaron en tiempo real. Con `pauseAt` el tiempo se detiene, y `runFor(1000)` avanza exactamente un tick.
