import { FIELD_WIDGETS } from "./schema";

// Legacy walks every [data-field] in the DOM, so untouched fields still ship as "".
// Deriving the same set from the schema keeps that guarantee without depending on
// which fields react-hook-form happens to have registered.
export function fieldLeaves(field) {
  if (field.checkboxOptions) {
    return field.checkboxOptions.map((o) => ({ id: o.fieldId, kind: "checkbox" }));
  }
  if (field.rows) {
    return field.rows.map((r) => ({ id: r.fieldId, kind: "text" }));
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
    leaves.push({ id: field.fieldId, kind: "text" });
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

export function collectPayload(schema, values) {
  const payload = {};
  for (const leaf of schemaLeaves(schema)) {
    const value = values?.[leaf.id];
    payload[leaf.id] = leaf.kind === "checkbox" ? !!value : value ?? "";
  }
  return payload;
}

// Legacy's collectData(): carries _meta and, unlike the save payload, no skip marks.
export function buildExportData(schema, values) {
  return {
    _meta: { savedAt: new Date().toISOString(), form: schema?.formKey ?? "OASIS-E2" },
    ...collectPayload(schema, values),
  };
}

export function exportFileName(schema, now = new Date()) {
  return `${schema?.formKey ?? "OASIS-E2"}_${now.toISOString().slice(0, 10)}.json`;
}
