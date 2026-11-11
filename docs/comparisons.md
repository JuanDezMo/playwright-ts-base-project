# Comparativas entre niveles de prueba

El mismo escenario del login se prueba en distintos niveles para aprender qué valida cada tipo de prueba, cuánto cuesta y cuándo conviene. Se completa al cerrar las iteraciones 2, 3 y 4 de [playwright-iterations.md](playwright-iterations.md).

Cómo medir:

- **Tiempo:** `pnpm exec playwright test <archivo> --repeat-each=5 --reporter=list` y promediar las duraciones.
- **Estabilidad:** `--repeat-each=10` sin fallos.
- **Qué la rompe:** cambiar a propósito un mensaje del mock, un label del HTML o el mensaje esperado y ver cuál falla.

## Comparativa 1: credenciales inválidas

| Criterio | API-AUTH-01 (API · componente) | C-03 (UI · componente) |
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
