import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { uniqueById, groupByCause, dayFirst } from '../src/lib/kb/causes.ts';

const read = async (p) => JSON.parse(await readFile(new URL(p, import.meta.url), 'utf8'));
const raw = await read('../src/lib/data/reports-4471.json');
const tenants = await Promise.all((await readdir(new URL('../src/lib/data/tenants/', import.meta.url)))
  .filter((f) => f.endsWith('.json')).map((f) => read(`../src/lib/data/tenants/${f}`)));
const tenantMap = new Map(tenants.map((t) => [t.handle, t]));
const reports = uniqueById(raw).filter((r) => r.mergedInto === 4471);
const groups = groupByCause(reports, (r) => tenantMap.get(r.tenant));
if (groups.some((g) => g.cause === 'unplaced')) throw Error('Unplaced reports need investigation');
if (tenants.some((t) => !dayFirst(t.locale))) throw Error('Check changed tenant date conventions');
const notes = await read('../src/lib/data/desk-notes.json');
const summary = {
  rawRows: raw.length, uniqueReports: reports.length, duplicateRows: raw.length - uniqueById(raw).length,
  groups: groups.map(({ reports, ...g }) => ({ ...g, count: reports.length, ids: reports.map((r) => r.id) })),
  oneDayReports: reports.filter((r) => notes.oneDayMove.includes(r.id)),
  receivedByMonth: {}, mergedByDay: {}
};
for (const r of reports) {
  const m = r.receivedAt.slice(0, 7), d = r.mergedAt?.slice(0, 10);
  summary.receivedByMonth[m] = (summary.receivedByMonth[m] ?? 0) + 1;
  if (d) summary.mergedByDay[d] = (summary.mergedByDay[d] ?? 0) + 1;
}
await mkdir(new URL('../analysis/', import.meta.url), { recursive: true });
await writeFile(new URL('../analysis/report.json', import.meta.url), JSON.stringify(summary, null, 2) + '\n');
await mkdir(new URL('../issues/', import.meta.url), { recursive: true });
const details = {
  parser: {
    title: 'Shared date parser treats day-first tenant dates as MM/DD/YYYY',
    mechanism: 'The shared parser reads month first even when the tenant locale writes day first. For example, Harbour Dental’s 7 April reminder became 4 July (R-41200). This affects app/email reports and booking-v2 forms; booking-v3 form submissions belong to the separate hint issue.',
    fix: 'Parse explicit date parts using the tenant locale, or accept a canonical unambiguous date at the boundary. Preserve the intended calendar date through invite generation. Verify 07/04 is 7 April for en-GB and 4 July for en-US, and that day values above 12 work.',
    caveat: 'Five reports (R-41202, R-41209, R-41236, R-41344, R-41620) describe one-day or otherwise unusual symptoms. The exported classifier includes all five here by tenant/channel. These symptoms do not establish a timezone cause; investigate them individually before assuming the parser fix resolves them.'
  },
  hint: {
    title: 'booking-v3 date hint says MM/DD/YYYY for day-first tenants',
    mechanism: 'booking-v3 prints MM/DD/YYYY, encouraging month-first input, while the form interprets it using the tenant’s day-first convention. The affected form-report tenants are Alder Physio, Copper Studio and Pale Harbour. Example R-41241: 6 August became 8 June. This is independent of the shared parser bug.',
    fix: 'Generate the displayed hint from the same locale/date-format configuration used to interpret input. Verify all three affected locales; use an unambiguous control or clear date preview. Regression-test booking-v2 and app/email separately.',
    caveat: 'The intake tag comes from browser locale and is a guess. Determine this cause from tenant locale, form version and report channel instead.'
  }
};
for (const g of groups) {
  const d = details[g.cause];
  const body = `# ${d.title}\n\n## Scope\n\n${g.reports.length} distinct reports merged into #4471; ${g.tenants} tenants; received ${g.firstSeen} through ${g.lastSeen}. Counted once per report ID using the exported causes.ts and tenant directory.\n\n## Evidence and mechanism\n\n${d.mechanism}\n\n## Proposed fix and acceptance checks\n\n${d.fix}\n\n## Limits\n\n${d.caveat}\n\n## Report IDs\n\n${g.reports.map((r) => r.id).join(', ')}\n`;
  await writeFile(new URL(`../issues/${g.cause}.md`, import.meta.url), body);
}
console.log(JSON.stringify({ rawRows: summary.rawRows, uniqueReports: summary.uniqueReports,
  duplicateRows: summary.duplicateRows, causes: summary.groups.map(({ cause, count }) => ({ cause, count })) }, null, 2));
