import { FIELD_WIDGETS, LEGACY_ENGINES } from "./schema";
import { applySkipMarks } from "./skipLogic";

const isRuleEngine = (schema) => schema?.legacyEngine === LEGACY_ENGINES.RULE;

// Legacy walks every [data-field] in the DOM, so untouched fields still ship as "".
// Deriving the same set from the schema keeps that guarantee without depending on
// which fields react-hook-form happens to have registered.
export function fieldLeaves(field) {
  if (field.checkboxOptions) {
    return field.checkboxOptions.map((o) => ({ id: o.fieldId, kind: "checkbox" }));
  }
  if (field.rows) {
    const kind = field.widget === FIELD_WIDGETS.COUNT_GRID ? "number" : "text";
    return field.rows.map((r) => ({ id: r.fieldId, kind }));
  }
  if (field.tableRows) {
    const kind = field.widget === FIELD_WIDGETS.CHECKBOX_TABLE ? "checkbox" : "text";
    return field.tableRows.flatMap((r) => r.fieldIds.filter(Boolean).map((id) => ({ id, kind })));
  }
  if (field.diagnosisRows) {
    return field.diagnosisRows.flatMap((r) => [
      { id: r.icdFieldId, kind: "text" },
      { id: r.severityFieldId, kind: "text" },
    ]);
  }
  if (field.radioRows) {
    return field.radioRows.map((r) => ({ id: r.fieldId, kind: "radio" }));
  }

  const leaves = [];
  if (field.widget === FIELD_WIDGETS.SPLIT_DATE) {
    if (field.fieldId) {
      leaves.push(
        { id: `${field.fieldId}_month`, kind: "text" },
        { id: `${field.fieldId}_day`, kind: "text" },
        { id: `${field.fieldId}_year`, kind: "text" }
      );
    }
  } else if (field.fieldId) {
    leaves.push({ id: field.fieldId, kind: field.widget === FIELD_WIDGETS.NUMERIC ? "number" : "text" });
  }

  if (field.pairedField?.fieldId) {
    leaves.push({
      id: field.pairedField.fieldId,
      kind: field.pairedField.widget === "checkbox" ? "checkbox" : "text",
    });
  }
  return leaves;
}

export function fieldLeafIds(field) {
  return fieldLeaves(field).map((leaf) => leaf.id);
}

export function schemaLeaves(schema) {
  return (schema?.sections ?? []).flatMap((section) => (section.items ?? []).flatMap(fieldLeaves));
}

const isBlank = (value) => value === undefined || value === null || value === "";

// Checkboxes: the core engine sends true/false, the rule engines "1"/"0".
// Radio-only rows (no code box) are read from checked radios, so unanswered rows send no key.
export function collectPayload(schema, values) {
  const payload = {};
  const ruleEngine = isRuleEngine(schema);
  for (const leaf of schemaLeaves(schema)) {
    const value = values?.[leaf.id];
    if (leaf.kind === "checkbox") {
      payload[leaf.id] = ruleEngine ? (value ? "1" : "0") : !!value;
    } else if (leaf.kind === "radio") {
      if (!isBlank(value)) payload[leaf.id] = value;
    } else {
      payload[leaf.id] = value ?? "";
    }
  }
  for (const section of schema?.sections ?? []) {
    for (const field of section.items ?? []) {
      if (!field.radioAlias) continue;
      const value = payload[field.fieldId];
      if (field.options?.some((opt) => opt.value === value)) payload[field.radioAlias] = value;
    }
  }
  return payload;
}

// Mirrors legacy applyData(): a checkbox is ticked only by true / "true" / 1 / "1" (so a saved
// "0" or "^" loads unticked), and a number input drops any non-numeric value ("^" reloads blank).
export function normalizeLoadedValues(schema, values) {
  if (!values) return values;
  const normalized = { ...values };
  for (const leaf of schemaLeaves(schema)) {
    const value = normalized[leaf.id];
    if (value === undefined) continue;
    if (leaf.kind === "checkbox") {
      normalized[leaf.id] = value === true || value === "true" || value === 1 || value === "1";
    } else if (leaf.kind === "number" && value !== "" && Number.isNaN(Number(value))) {
      normalized[leaf.id] = "";
    }
  }
  return normalized;
}

// An explicit blank for every input. reset({}) alone leaves register()-ed inputs (dates, text,
// numbers) showing their old value, which react-hook-form then reads back from the DOM.
export function blankValues(schema) {
  return Object.fromEntries(schemaLeaves(schema).map((leaf) => [leaf.id, leaf.kind === "checkbox" ? false : ""]));
}

export function applyDefaults(schema, values) {
  const withDefaults = { ...values };
  for (const section of schema?.sections ?? []) {
    for (const field of section.items ?? []) {
      if (field.defaultValue === undefined || !field.fieldId) continue;
      const value = withDefaults[field.fieldId];
      if (value === undefined || value === null || value === "") withDefaults[field.fieldId] = field.defaultValue;
    }
  }
  return withDefaults;
}

// mapped_data for save_oasis_json (Save and Send for Review). The rule engines append _meta.
export function buildSavePayload(schema, values, now = new Date()) {
  const payload = applySkipMarks(schema, collectPayload(schema, values));
  if (!isRuleEngine(schema)) return payload;
  return { ...payload, _meta: { savedAt: now.toISOString(), form: schema.formKey } };
}

// Core engine exports collectData(): _meta, no skip marks. Rule engines export
// getRawFormData(): skip marks, no _meta.
export function buildExportData(schema, values) {
  if (isRuleEngine(schema)) return applySkipMarks(schema, collectPayload(schema, values));
  return {
    _meta: { savedAt: new Date().toISOString(), form: schema?.formKey ?? "OASIS-E2" },
    ...collectPayload(schema, values),
  };
}

export function exportFileName(schema, patientName, now = new Date()) {
  const formKey = schema?.formKey ?? "OASIS-E2";
  if (isRuleEngine(schema)) return `${formKey}_${(patientName?.trim() || "patient").replace(/\s+/g, "_")}.json`;
  return `${formKey}_${now.toISOString().slice(0, 10)}.json`;
}
