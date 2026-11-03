# booking-v3 date hint says MM/DD/YYYY for day-first tenants

## Scope

33 distinct reports merged into #4471; 3 tenants; received 2026-04-17 through 2026-09-22. Counted once per report ID using the exported causes.ts and tenant directory.

## Evidence and mechanism

booking-v3 prints MM/DD/YYYY, encouraging month-first input, while the form interprets it using the tenant’s day-first convention. The affected form-report tenants are Alder Physio, Copper Studio and Pale Harbour. Example R-41241: 6 August became 8 June. This is independent of the shared parser bug.

## Proposed fix and acceptance checks

Generate the displayed hint from the same locale/date-format configuration used to interpret input. Verify all three affected locales; use an unambiguous control or clear date preview. Regression-test booking-v2 and app/email separately.

## Limits

The intake tag comes from browser locale and is a guess. Determine this cause from tenant locale, form version and report channel instead.

## Report IDs

R-41230, R-41241, R-41251, R-41259, R-41262, R-41275, R-41294, R-41305, R-41308, R-41366, R-41372, R-41384, R-41387, R-41396, R-41400, R-41406, R-41415, R-41416, R-41418, R-41428, R-41439, R-41441, R-41449, R-41453, R-41456, R-41460, R-41472, R-41485, R-41493, R-41539, R-41572, R-41582, R-41584
