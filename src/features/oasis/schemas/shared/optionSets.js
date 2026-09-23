// Option sets and legend text reused across OASIS fields — centralized so they're
// typed once rather than retyped per field. YES_NO is used once within FU (M1306)
// but is one of the most common OASIS answer patterns and will be reused heavily
// once ROC/DC/DAH/TRN are encoded (Phase 4).

export const YES_NO = [
  { value: "0", label: "No" },
  { value: "1", label: "Yes" },
];

// GG0130/GG0170 performance code legend — shown once as prose above each GG table in
// legacy, not per-row. Not wired into GgMatrixField yet (that widget has no legend
// slot today); kept here so Phase 1 Step 2 can surface it without re-deriving the text.
export const GG_CODE_LEGEND =
  "06=Independent, 05=Setup/clean-up assist, 04=Supervision/touching assist, " +
  "03=Partial/moderate assist, 02=Substantial/maximal assist, 01=Dependent. " +
  "If not attempted: 07=Patient refused, 09=Not applicable, 10=Environmental limitations, 88=Medical condition/safety concerns.";
