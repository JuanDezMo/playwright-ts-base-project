// Genera los mocks de UI · componente a partir de los ejemplos de openapi.yaml.
// Uso: pnpm gen:mocks   (OPENAPI_PATH permite apuntar a otro contrato)
//
// Salida (no se edita a mano):
//   src/mocks/generated/<operationId>/<status>.<ejemplo>.json  un archivo por ejemplo (legible)
//   src/mocks/generated/index.ts                               los mismos datos, tipados para importar
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

type Json = Record<string, unknown>

const specPath = path.resolve(process.env.OPENAPI_PATH ?? '../accounts_api/openapi.yaml')
const outDir = path.resolve('src/mocks/generated')
const spec = parse(readFileSync(specPath, 'utf8')) as Json

// Resuelve una referencia local "#/components/..." dentro del contrato
function resolve(node: unknown): Json {
  const ref = (node as Json | undefined)?.$ref
  if (typeof ref !== 'string') return (node ?? {}) as Json
  return ref
    .replace(/^#\//, '')
    .split('/')
    .reduce<unknown>((current, key) => (current as Json)[key], spec) as Json
}

// Ejemplos de una respuesta: example, examples o, si no hay, el example del schema
function examplesOf(response: Json): Record<string, unknown> {
  const media = resolve((response.content as Json | undefined)?.['application/json'])
  if ('example' in media) return { example: media.example }
  if (media.examples) {
    return Object.fromEntries(
      Object.entries(media.examples as Json).map(([name, value]) => [name, resolve(value).value]),
    )
  }
  const schema = resolve(media.schema)
  if ('example' in schema) return { schema: schema.example }
  if (Array.isArray(schema.examples) && schema.examples.length > 0) return { schema: schema.examples[0] }
  return {}
}

const index: Record<string, Record<string, Record<string, unknown>>> = {}
let files = 0

rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })
writeFileSync(path.join(outDir, '.gitattributes'), '# Archivos generados por pnpm gen:mocks\n* linguist-generated=true\n')
for (const operations of Object.values(spec.paths as Json)) {
  for (const operation of Object.values(operations as Json)) {
    const { operationId, responses } = operation as Json
    if (typeof operationId !== 'string' || !responses) continue
    for (const [status, rawResponse] of Object.entries(responses as Json)) {
      for (const [name, value] of Object.entries(examplesOf(resolve(rawResponse)))) {
        if (value === undefined) continue
        const file = path.join(outDir, operationId, `${status}.${name}.json`)
        mkdirSync(path.dirname(file), { recursive: true })
        writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
        ;((index[operationId] ??= {})[status] ??= {})[name] = value
        files++
      }
    }
  }
}

writeFileSync(
  path.join(outDir, 'index.ts'),
  `// GENERADO por scripts/gen-mocks.ts desde ${path.relative(process.cwd(), specPath)}. No editar a mano.\n` +
    `export const examples = ${JSON.stringify(index, null, 2)} as const\n`,
)
console.log(`gen:mocks → ${files} examples from ${Object.keys(index).length} operations into ${path.relative(process.cwd(), outDir)}`)
