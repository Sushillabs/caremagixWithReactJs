import { fieldLeaves } from "./payload";

// Backend sends html_keys (array), or html_key, or only xml_tag.
export function errorFieldKeys(error) {
  if (Array.isArray(error?.html_keys) && error.html_keys.length) return error.html_keys;
  if (error?.html_key) return [error.html_key];
  return error?.xml_tag ? [error.xml_tag] : [];
}

export function errorLabel(error) {
  return error?.xml_tag || errorFieldKeys(error)[0] || "";
}

export function findSectionIdForField(schema, fieldId) {
  for (const section of schema?.sections ?? []) {
    for (const field of section.items ?? []) {
      if (fieldLeaves(field).some((leaf) => leaf.id === fieldId)) return section.id;
    }
  }
  return null;
}

// Legacy branches the same three ways on every failed XML/review call:
// field-level validation errors, a top-level error banner, or neither.
export function classifyApiError(err) {
  const body = err?.response?.data;
  if (body?.validation_errors?.length) {
    return { kind: "validation", errors: body.validation_errors, headline: body.error ?? "", topLevel: null };
  }
  if (body?.error) {
    return { kind: "topLevel", errors: [], headline: "", topLevel: body };
  }
  return { kind: "unknown", errors: [], headline: "", topLevel: null, message: err?.message ?? "Request failed" };
}

export function indexErrors(schema, errors) {
  const byFieldId = new Map();
  const sectionIds = new Set();

  for (const error of errors ?? []) {
    const keys = errorFieldKeys(error);
    if (!keys.length) continue;
    for (const key of keys) {
      if (!byFieldId.has(key)) byFieldId.set(key, []);
      byFieldId.get(key).push(error);
    }
    const sectionId = findSectionIdForField(schema, keys[0]);
    if (sectionId) sectionIds.add(sectionId);
  }
  return { byFieldId, sectionIds };
}
