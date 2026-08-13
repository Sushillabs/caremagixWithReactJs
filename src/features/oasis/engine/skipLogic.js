/**
 * Skip-logic evaluator — decides whether a field should be hidden given the current
 * form answers. Reads each field's own `skipWhen.when(answers)` (schema.js's
 * SkipCondition); this module doesn't know any clinical rules itself, it just applies
 * whatever rule the schema attached to that field.
 */

export function isFieldSkipped(field, answers) {
  return field.skipWhen ? !!field.skipWhen.when(answers) : false;
}

export function filterVisibleFields(fields, answers) {
  return fields.filter((field) => !isFieldSkipped(field, answers));
}
