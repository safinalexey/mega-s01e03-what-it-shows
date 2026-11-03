<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  const merged = uniqueById(reports as Report[]).filter(r => r.mergedInto === 4471);
  const months = [...new Set(merged.map(r => r.receivedAt.slice(0, 7)))].sort();
  const burst = merged.filter(r => r.mergedAt?.startsWith('2026-07-02')).length;
  const days = merged.map(r => r.receivedAt.slice(0, 10)).sort();
  const unusual = merged.filter(r => notes.oneDayMove.includes(r.id));
</script>

<p>The export has {reports.length} rows and {merged.length} distinct reports in #4471.
  Remove overlapping export rows by report ID before counting: {reports.length - merged.length} rows repeat IDs.</p>
<p>Reports arrived from {days[0]} to {days.at(-1)}. On 2026-07-02 the desk merged {burst} reports;
  that merge burst does not show when the problems began. Incoming reports continue after it.</p>
<table>
  <thead><tr><th>Received month</th><th>Distinct reports</th></tr></thead>
  <tbody>{#each months as month}<tr><td>{month}</td><td>{merged.filter(r => r.receivedAt.startsWith(month)).length}</td></tr>{/each}</tbody>
</table>
<h3>Unresolved symptom exceptions</h3>
<p>{unusual.length} reports have unusual symptoms that the exported classifier assigns to parser by tenant/channel.
  Keep them in that count, but investigate their bodies before treating a parser fix as complete.
  The export does not establish an additional shared cause.</p>
<ul>{#each unusual as report}<li><code>{report.id}</code>: {report.body}</li>{/each}</ul>
