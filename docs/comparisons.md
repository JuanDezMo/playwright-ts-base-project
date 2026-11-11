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

| Criterio | API-AUTH-02 (API · componente) | E2E-00 (UI · e2e) |
| --- | --- | --- |
| Tipo de prueba | | |
| Tiempo de ejecución (promedio de 5 ejecuciones) | | |
| Líneas de la prueba (sin contar fixtures) | | |
| Archivos que tuve que crear (Locators, Actions, mocks, clientes) | | |
| ¿Necesita la API levantada? | | |
| ¿Necesita el frontend levantado? | | |
| ¿Deja estado en la base de datos? | | |
| ¿Qué cambio la rompe? (mensaje, HTML, regla de negocio, contrato) | | |
| ¿Qué error detecta que la otra no? | | |
| ¿Es estable al repetirla 10 veces? | | |

**Conclusión** (2 o 3 líneas):

## Comparativa 3: bloqueo tras 5 intentos

| Criterio | API-AUTH-03 (API · componente, API real) | C-04 (UI · componente, 429 simulado) |
| --- | --- | --- |
| Tipo de prueba | | |
| Tiempo de ejecución (promedio de 5 ejecuciones) | | |
| Líneas de la prueba (sin contar fixtures) | | |
| Archivos que tuve que crear (Locators, Actions, mocks, clientes) | | |
| ¿Necesita la API levantada? | | |
| ¿Necesita el frontend levantado? | | |
| ¿Deja estado en la base de datos? | | |
| ¿Qué cambio la rompe? (mensaje, HTML, regla de negocio, contrato) | | |
| ¿Qué error detecta que la otra no? | | |
| ¿Es estable al repetirla 10 veces? | | |

**Conclusión** (2 o 3 líneas): ¿cuándo conviene simular la API y cuándo usar la real?
