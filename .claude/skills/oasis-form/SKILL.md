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
  - `agencySections.js` — section config (`blocks`), `agencyValues()` (blank + merge saved), `agencyProgress()`, `agencySection` (added at the end of `soc.schema.js` sections)
  - `AgencyAssessment.jsx` — collapsible cards, one per section; picks the renderer per block type
  - `YesNoDateRows.jsx` — block `yesNo`: Yes/No (tap again to clear) + Date(s), optional Specify text and L/R checks
  - `AgencyBlocks.jsx` — block `checks` (checkbox + optional inline detail input/select), `inputs` (labelled text grid; `wide: true` = one per line), `notes` (textarea), `choice` (single-select buttons, tap again to clear), `image` (static picture, no input)
  - `images/` — body drawings cropped from the agency SOC PDF (p19 pain, p20 skin). Shown read-only for now; clickable body map is deferred — nurses write location in text fields.
- Form state:
  - `yesNo` rows: `agency_assessment.<section>.<row>.{answer, date, specify?, left?, right?}`; `answer` is `"yes" | "no" | ""`
  - other blocks: flat keys `agency_assessment.<section>.<key>` (checkbox → boolean, detail/input/notes → string)
- Keys are snake_case and unique inside a section.
- If a paper-form page also holds a CMS item (e.g. M1400 on the Respiratory page), keep it in the CMS tab and add a section `hint` pointing to it.
- Save: sent as top-level `agency_assessment` in `/save_oasis_json` (next to `raw_data` / `mapped_data`). Load: read `res.agency_assessment` (review mode only, like CMS answers).
- Never put agency data in `raw_data`, `mapped_data`, CMS validation, skip marks, Export JSON, or the XML export.
- All agency fields are optional. Totals (Braden, Fall Risk) are auto-calculated; Fall Risk scores are suggested from CMS answers but editable.
- Review mode does not lock fields — same as CMS tabs.

## Adding a new agency section
1. Add the section to `AGENCY_SECTIONS` in `agencySections.js` using existing block types (`yesNo`, `checks`, `inputs`, `notes`, `choice`, `image`); labels as on the paper form.
2. Only if no block type fits: add a new type — its blank values in `blockLeaves()` / `sectionValues()`, its renderer in `AgencyAssessment.jsx` `Block`.
3. Check save payload: data appears only under `agency_assessment`, and Clear All resets it.

## Working rules
- One phase per turn; ask before every commit.
- Write `CHANGELOG.md` (short lines) only right before a commit.
