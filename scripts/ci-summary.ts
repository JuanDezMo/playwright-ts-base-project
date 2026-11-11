// Resumen de tiempos para el job de GitHub Actions (se anexa a $GITHUB_STEP_SUMMARY).
// Uso: node scripts/ci-summary.ts "<título>" >> "$GITHUB_STEP_SUMMARY"
import { existsSync, readFileSync } from 'node:fs'

type Spec = { title: string; file: string; tests: SpecTest[] }
type SpecTest = { projectName: string; status: string; results: { duration: number }[] }
type Suite = { specs?: Spec[]; suites?: Suite[] }

const title = process.argv[2] ?? 'Playwright'
const file = 'test-results/results.json'

if (!existsSync(file)) {
  console.log(`## ${title}\n\nNo ${file} (the run did not finish).`)
  process.exit(0)
}

const report = JSON.parse(readFileSync(file, 'utf8')) as { suites: Suite[]; stats: { duration: number } }

const rows: { project: string; name: string; status: string; ms: number }[] = []
const walk = (suite: Suite): void => {
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests) {
      rows.push({
        project: t.projectName,
        name: `${spec.file}: ${spec.title}`,
        status: t.status,
        ms: t.results.reduce((sum, r) => sum + r.duration, 0),
      })
    }
  }
  suite.suites?.forEach(walk)
}
report.suites.forEach(walk)

const seconds = (ms: number): string => `${(ms / 1000).toFixed(1)} s`
const byProject = new Map<string, typeof rows>()
for (const row of rows) byProject.set(row.project, [...(byProject.get(row.project) ?? []), row])

console.log(`## ${title}\n\nTotal: **${seconds(report.stats.duration)}** · ${rows.length} tests\n`)
console.log('| Project | Tests | Passed | Failed | Flaky | Skipped | Time (sum) |')
console.log('| --- | ---: | ---: | ---: | ---: | ---: | ---: |')
for (const [project, items] of byProject) {
  const count = (status: string): number => items.filter((r) => r.status === status).length
  const time = items.reduce((sum, r) => sum + r.ms, 0)
  console.log(
    `| ${project} | ${items.length} | ${count('expected')} | ${count('unexpected')} | ${count('flaky')} | ${count('skipped')} | ${seconds(time)} |`,
  )
}
console.log('\n**Slowest tests**\n')
for (const r of [...rows].sort((a, b) => b.ms - a.ms).slice(0, 5)) {
  console.log(`- ${seconds(r.ms)} · \`${r.project}\` · ${r.name}`)
}
