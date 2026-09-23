import { createContext, useContext } from "react";
import { fieldLeaves } from "./payload";

const ValidationContext = createContext({ byFieldId: new Map(), sectionIds: new Set() });

export function ValidationProvider({ value, children }) {
  return <ValidationContext.Provider value={value}>{children}</ValidationContext.Provider>;
}

export function useFieldErrors(field) {
  const { byFieldId } = useContext(ValidationContext);
  if (!byFieldId.size) return [];
  return fieldLeaves(field).flatMap((leaf) =>
    (byFieldId.get(leaf.id) ?? []).map((error) => ({ fieldId: leaf.id, error }))
  );
}
