---
name: oasis-form
description: Use when adding or changing OASIS forms (SOC, ROC, FU, DC, DAH, TRN) — CMS items in schemas, or the non-CMS "Additional Fields" tab (agency content) saved under agency_assessment.
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
  - `AgencyBlocks.jsx` — block `checks` (checkbox + optional inline detail input/select; `wide: true` = one per line for long labels), `inputs` (labelled text grid; `wide: true` = one per line, `pairs: true` = always 2 columns), `notes` (textarea; `lines` = height), `choice` (single-select buttons, tap again to clear), `choices` (list of choice rows, e.g. Yes/No/NA, each with optional `detail` input), `image` (static picture, no input)
  - Block props: `rows` is always a list (yesNo/score/choices); never reuse it for a number.
  - Supplies use `supplyGroup(group, title, labels)` — keys are `<group>_<slug(label)>` because labels repeat across groups (e.g. `dressing_tape`, `iv_tape`, `gi_tape`); each group gets `<group>_other` + `<group>_other_detail`.
  - `ScoreBlocks.jsx` — block `score` (rows of scored buttons; optional `suggest` from CMS answers with a "Use" button — never auto-fills) and `total` (auto total + risk level, written to `<section>.total` / `<section>.risk_level`; total stays blank until every scored row is answered)
  - `SignatureBlock.jsx` — block `signature` (last card, `agency_assessment.signature.{image, title, date, time}`): `react-signature-canvas` like Visit Notes AI; saves the trimmed PNG as a data URL; fills date/time on first stroke; a saved signature shows as an image with "Clear and sign again". Cards start collapsed (`hidden`), so the canvas mounts at 0px — the ResizeObserver resize is required, don't remove it.
  - Any block can have `showWhen(sectionValues)` — hidden blocks keep their values (e.g. fall-risk referral shows at total ≥ 10).
  - `images/` — drawings cropped from the agency SOC PDF (p19 pain, p20 skin, p30 fall algorithm). Shown read-only; clickable body map is deferred — nurses write location in text fields.
- CMS suggestion mapping (Fall Risk): A ← M1700 (0→0, 1–3→4 intermittent, 4→2 disoriented), C ← M1860 ≥4 → 2 else M1610=1 or M1620≥1 → 4 else 0, D ← B1000 (0→0, 1–2→2, 3–4→4). No suggestion for B, F, G, H (no matching CMS item). Read CMS codes with `parseInt` (values can be "0" or "00").
- Form state:
  - `yesNo` rows: `agency_assessment.<section>.<row>.{answer, date, specify?, left?, right?}`; `answer` is `"yes" | "no" | ""`
  - other blocks: flat keys `agency_assessment.<section>.<key>` (checkbox → boolean, detail/input/notes → string)
- Keys are snake_case and unique inside a section.
- Choice values are lowercase snake_case codes, never display text: options are `[value, label]` pairs (`YES_NO`, `YES_NO_NA` → `"yes" | "no" | "na"`; `"good"`, `"see_visit_documentation"`). Same as yesNo rows.
- Exact dates use `date: true` (native date picker, saved as `"YYYY-MM-DD"`). Exception: Neuro history `Date(s)` stays free text — nurses write "2019", "03/2021" or several dates.
- If a paper-form page also holds a CMS item (e.g. M1400 on the Respiratory page), keep it in the CMS tab and add a section `hint` pointing to it.
- Save is separate: "Save Non-CMS" → `POST /save_agency_assessment` with `{ patient_name, patient_id, form_name, agency_assessment }` (`saveAgencyToServer` in `engine/saveLoad.js`). `/save_oasis_json` ("Save CMS") must never carry agency data.
- Load is shared: `/get_oasis_json` returns `agency_assessment`; applied in review mode only, fill mode starts blank (same as CMS).
- No clear for non-CMS: on SOC the button reads "Clear CMS" and keeps agency values on screen; `/clear_oasis_json` must not touch agency data. Send for Review saves/sends CMS only.
- Unsaved dots: `OasisFormPage` compares current CMS payload / agency object to snapshots taken at load and after each successful save. Forms without an agency section keep the old "Save" / "Clear All" labels and no dots.
- Never put agency data in `raw_data`, `mapped_data`, CMS validation, skip marks, Export JSON, or the XML export.
- All agency fields are optional. Totals (Braden, Fall Risk) are auto-calculated; Fall Risk scores are suggested from CMS answers but editable.
- Review mode does not lock fields — same as CMS tabs.

## Adding a new agency section
1. Add the section to `AGENCY_SECTIONS` in `agencySections.js` using existing block types (`yesNo`, `checks`, `inputs`, `notes`, `choice`, `choices`, `image`, `score`, `total`, `signature`); labels as on the paper form.
2. Only if no block type fits: add a new type — its blank values in `blockLeaves()` / `sectionValues()`, its renderer in `AgencyAssessment.jsx` `Block`.
3. Check save payload: data appears only under `agency_assessment`, and Clear All resets it.

## Working rules
- One phase per turn; ask before every commit.
- Write `CHANGELOG.md` (short lines) only right before a commit.
