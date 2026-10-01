import { FIELD_WIDGETS as W } from "../../../engine/schema";

// Every question in this folder takes its wire-level field key(s) as arguments, so one
// definition serves forms that key the same CMS item differently (ROC "M1306" vs SOC
// "M1306_UNHLD_STG2_PRSR_ULCR").

export const opts = (pairs) =>
  pairs.map(([value, label, groupLabel]) => (groupLabel ? { value, label, groupLabel } : { value, label }));

export const coded = (itemCode, fieldId, label, pairs, extra = {}) => ({
  itemCode,
  fieldId,
  label,
  widget: W.CODED_RADIO,
  maxLength: 1,
  options: opts(pairs),
  ...extra,
});

export const checks = (itemCode, label, keys, labels, extra = {}) => ({
  itemCode,
  label,
  widget: W.CHECKBOX_GROUP,
  checkboxOptions: labels.map((entry, i) => {
    const [text, groupLabel] = [].concat(entry);
    return { fieldId: keys[i], itemCode: keys[i], label: text, ...(groupLabel ? { groupLabel } : {}) };
  }),
  ...extra,
});

export const splitDate = (itemCode, fieldId, label, extra = {}) => ({
  itemCode,
  fieldId,
  label,
  widget: W.SPLIT_DATE,
  ...extra,
});

export const numeric = (itemCode, fieldId, label, range, extra = {}) => ({
  itemCode,
  fieldId,
  label,
  widget: W.NUMERIC,
  range,
  ...extra,
});

export const pairedCheckbox = (fieldId, label) => ({ fieldId, label, widget: "checkbox" });

export const notice = (itemCode, title, lines, extra = {}) => ({
  itemCode,
  widget: W.NOTICE,
  title,
  lines,
  ...extra,
});

export const keysOf = (prefix, suffixes, tail = "") => suffixes.map((s) => `${prefix}${s}${tail}`);
