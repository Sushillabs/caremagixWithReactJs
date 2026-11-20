---
name: oasis-form
description: Use when adding or changing OASIS forms (SOC, ROC, FU, DC, DAH, TRN) — CMS items in schemas, or the non-CMS "Agency (non-CMS)" tab saved under agency_assessment.
---

# OASIS forms

## CMS version
- Follow **CMS OASIS-E2** (effective 2026-04-01). Source: https://www.cms.gov/medicare/quality/home-health/oasis-data-sets
- Agency paper forms may be older (e.g. "RN SOC (1/2023)" = OASIS-E). Do NOT add items CMS removed:
  - M0110 Episode Timing, M2200 Therapy Need (removed in E1, 2025-01-01)
  - GG0130 / GG0170 Discharge Goal column (removed in E1)
  - A1250 Transportation → replaced by A1255 (E2)

## CMS items (`src/features/oasis/schemas/*.schema.js`)
- Field keys, option codes and max lengths stay exactly as the legacy form. Flow/design is shared across forms.
- Patient demographics (M0018, M0014, M0016, M0030, M0040, M0050, M0060, M0063–M0066, M0150) live in `wizard/PrefillDemographics.jsx`, not in the schema.

## Non-CMS agency content (SOC only for now)
- Lives in `src/features/oasis/agency/`:
  - `agencySections.js` — section/row config, `agencyValues()` (blank + merge saved), `agencyProgress()`, `agencySection` (added at the end of `soc.schema.js` sections)
  - `AgencyAssessment.jsx` — collapsible cards, one per section
  - `YesNoDateRows.jsx` — Yes/No (tap again to clear) + Date(s), optional Specify text and L/R checks
- Form state: `agency_assessment.<section>.<row>.{answer, date, specify?, left?, right?}`; `answer` is `"yes" | "no" | ""`.
- Save: sent as top-level `agency_assessment` in `/save_oasis_json` (next to `raw_data` / `mapped_data`). Load: read `res.agency_assessment` (review mode only, like CMS answers).
- Never put agency data in `raw_data`, `mapped_data`, CMS validation, skip marks, Export JSON, or the XML export.
- All agency fields are optional. Totals (Braden, Fall Risk) are auto-calculated; Fall Risk scores are suggested from CMS answers but editable.
- Review mode does not lock fields — same as CMS tabs.

## Adding a new agency section
1. Add the section config in `agencySections.js` (snake_case keys, labels as on the paper form).
2. Extend `agencyValues()` blank shape if the section uses a new input type.
3. Render it in `AgencyAssessment.jsx`; reuse `YesNoDateRows` where it fits.
4. Make sure `agencyProgress()` counts it.
5. Check save payload: data appears only under `agency_assessment`.

## Working rules
- One phase per turn; ask before every commit.
- Write `CHANGELOG.md` (short lines) only right before a commit.
