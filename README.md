# MEGA.dev S01E03 — what it shows

Local investigation of the course’s support KB export. No production product code is included.

## Reproduce

Requires Node.js 22.18+ (native TypeScript stripping) and npm.

```sh
npm install
npm run build
npm run preview
```

Open `/kb/` to inspect the original index and `/kb/incidents/4471-investigation/` for the signed investigation. `build/` contains the rendered KB and is part of the submission. `analysis/report.json` contains the computed classification; `issues/parser.md` and `issues/hint.md` are the proposed GitHub issues with complete report ID lists.

The original export is described in EXPORT-README.md. Original accepted decision 0001 is unchanged. Decision 0002 is a proposal, not a claim of desk acceptance. Counts follow the supplied classifier: 379 parser and 33 hint reports, including five symptom exceptions explicitly flagged for investigation.

After the course accepted both tickets, its engineering update reported #4471 closed on 5 October: parser fixed (`fix(dates): parse dd/mm for eu locales`); hint won't fix (booking-v3 retired). The investigation page records these distinct dispositions. They are engineering reports, not independent verification of production behavior.
