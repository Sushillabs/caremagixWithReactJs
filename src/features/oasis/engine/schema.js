/**
 * OASIS form schema — the shape every per-form schema (soc.schema.js, fu.schema.js, ...)
 * is authored against. A "schema" fully describes one OASIS-E2 form variant: its sections,
 * the fields inside each section, and how those fields render, default, and skip.
 *
 * Field keys stay exactly as legacy sends them per form (see aerial-view doc §G) — `fieldId`
 * is the literal wire-level string this form already uses in save_oasis_json / get_oasis_json,
 * even where it's inconsistent across forms (e.g. SOC's "GG0130A1" vs FU/ROC's "GG0130_A").
 * `itemCode` is the canonical CMS item this field represents, used to relate the same clinical
 * concept across forms without assuming they share a wire-level id.
 */

/**
 * @typedef {'coded-radio'|'checkbox-group'|'split-date'|'text'|'numeric'|'count-grid'
 *   |'text-unknown'|'hidden'|'email-action'|'file-import'|'button-group'|'gg-matrix'
 *   |'living-grid'|'ai-assist-trigger'} FieldWidget
 */
export const FIELD_WIDGETS = {
  CODED_RADIO: 'coded-radio',       // code-box + synced radio list (§1.1)
  CHECKBOX_GROUP: 'checkbox-group', // "check all that apply" (§1.2)
  SPLIT_DATE: 'split-date',         // MM/DD/YYYY triplet, optional NA/UK sibling (§1.3)
  TEXT: 'text',                     // plain free-text input (§1.4)
  NUMERIC: 'numeric',               // type=number with min/max (§1.5)
  COUNT_GRID: 'count-grid',         // fixed-row label+number grid, e.g. M1311 (§1.6)
  TEXT_UNKNOWN: 'text-unknown',     // text/date field + "unknown" sibling checkbox (§1.7)
  HIDDEN: 'hidden',                 // hidden field backing a custom widget (§1.10)
  EMAIL_ACTION: 'email-action',     // reviewer email + send action (§1.11)
  FILE_IMPORT: 'file-import',       // JSON state re-hydration (§1.12)
  BUTTON_GROUP: 'button-group',     // custom clickable button single-select, e.g. ROC severity (§1.15)
  GG_MATRIX: 'gg-matrix',           // GG0130/GG0170 one-code-per-row table (§b)
  LIVING_GRID: 'living-grid',       // M1100 row×column radio grid, ROC only (§b)
  AI_ASSIST_TRIGGER: 'ai-assist-trigger', // non-data-bearing plugin trigger, e.g. SOC coding assistant (§1.16)
};

/**
 * @typedef {Object} FieldOption
 * Used by CODED_RADIO / BUTTON_GROUP (all options share one `fieldId`, selecting an
 * option sets that field's value) and by LIVING_GRID (same, plus grid placement).
 * @property {string} value - option code as sent on the wire, e.g. "0", "NA", "88"
 * @property {string} label
 * @property {string} [rowGroup] - LIVING_GRID only, e.g. "Lives alone"
 * @property {string} [colGroup] - LIVING_GRID only, e.g. "Around-the-clock assistance"
 */

/**
 * @typedef {Object} CheckboxOptionDef
 * Used by CHECKBOX_GROUP. Unlike FieldOption, each checkbox is its own independent
 * CMS field (its own `fieldId`, boolean checked/unchecked) — not a shared value list
 * (§1.2: "each checkbox is an independent boolean field... not a bound array").
 * @property {string} fieldId - exact wire-level field id for this one checkbox
 * @property {string} itemCode - canonical CMS item code for this checkbox
 * @property {string} label
 */

/**
 * @typedef {Object} GridRowDef
 * Used by GG_MATRIX and COUNT_GRID. Each row is its own field (free-text code box for
 * GG_MATRIX, numeric/text count for COUNT_GRID) — never a radio group per row (§b, §1.6).
 * @property {string} fieldId - exact wire-level field id for this row
 * @property {string} itemCode - canonical CMS sub-item code, e.g. "GG0130A1"
 * @property {string} label - e.g. "A. Eating"
 */

/**
 * @typedef {Object} PairedField
 * Sibling boolean/text field bound to the same logical item (§1.7), e.g. an "Unknown"
 * checkbox next to an NPI input, or an "NA" checkbox next to a date triplet.
 * @property {string} fieldId - wire-level id of the sibling field, exact legacy string
 * @property {string} label
 * @property {'checkbox'} widget
 */

/**
 * @typedef {Object} SkipCondition
 * @property {(answers: Record<string, string|boolean|undefined>) => boolean} when
 *   Returns true when this item should be hidden/skipped. Reads other fields' current
 *   values from `answers`, keyed by their wire-level `fieldId` within the same form.
 * @property {string} [note] - human-readable skip hint shown under the field, matches
 *   legacy's `.q-skip-note` copy where one exists.
 */

/**
 * @typedef {Object} OasisFieldDef
 * @property {string} itemCode - canonical CMS item code, e.g. "M1700", "A1010" (group code
 *   for CHECKBOX_GROUP/GG_MATRIX/COUNT_GRID parents, which don't carry their own `fieldId`)
 * @property {string} [fieldId] - exact wire-level field id for THIS form. Omitted on
 *   CHECKBOX_GROUP/GG_MATRIX/COUNT_GRID parents, where each option/row carries its own instead.
 * @property {string} label
 * @property {FieldWidget} widget
 * @property {FieldOption[]} [options] - CODED_RADIO / BUTTON_GROUP / LIVING_GRID
 * @property {CheckboxOptionDef[]} [checkboxOptions] - CHECKBOX_GROUP only
 * @property {'list'|'two-col'|'grid-3'} [layout] - CHECKBOX_GROUP display variant only
 *   (§1.2 layout variants) — same field semantics either way
 * @property {GridRowDef[]} [rows] - GG_MATRIX / COUNT_GRID only
 * @property {string} [columnLabel] - GG_MATRIX only, form-specific header text
 *   (e.g. SOC's "SOC Code" vs FU's "Follow-up Performance" — display text, not a fixed constant)
 * @property {PairedField} [pairedField] - text-unknown / split-date NA-UK sibling
 * @property {string} [defaultValue] - applied only when the field is empty (§1.8),
 *   e.g. M0100_ASSMT_REASON defaulting to "08" on DAH
 * @property {SkipCondition} [skipWhen]
 * @property {number} [maxLength]
 * @property {{min: number, max: number}} [range] - numeric widgets only
 */

/**
 * @typedef {Object} OasisSectionDef
 * @property {string} id - e.g. "A", "GG", "M-SKIN"
 * @property {string} label
 * @property {OasisFieldDef[]} items
 */

/**
 * @typedef {Object} OasisFormSchema
 * @property {string} formKey - e.g. "OASIS-E2-FU", matches legacy's `data-form-key`
 * @property {string} formType - "SOC" | "ROC" | "FU" | "DC" | "DAH" | "TRN"
 * @property {OasisSectionDef[]} sections
 */
