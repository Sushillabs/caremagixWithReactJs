// TEMPORARY dummy data for building/testing the new structured MMTA UI.
// The backend's real structured MMTA API is not ready yet — this file
// exists only so the frontend can be built against the exact response
// shape already agreed with the backend team. Delete this file (and the
// temporary wiring in MmtaPage.jsx) once the real API is live.
//
// Shape matches exactly what the backend gave: status/mmta/response/
// cached/persisted/document_signature/document_count/generated_at.
export const MMTA_DUMMY_RESPONSE = {
  status: "success",
  question: "How should MMTA categorization be determined when the diagnosis column is blank or contains no information?",
  mmta: {
    title: "How should MMTA categorization be determined",
    subtitle: "when the diagnosis column is blank or contains no information?",
    intro:
      "Here's a table summarizing how MMTA categorization is typically determined from the principal diagnosis, with the relevant ICD-10 and CPT codes.",
    columns: ["Scenario", "MMTA Categorization", "ICD Codes", "CPT Codes", "Notes / Guidance"],
    rows: [
      {
        scenario: "Congestive heart failure",
        mmta_categorization: "MMTA - Cardiac and Circulatory",
        icd_codes: { value: "I50.9", note: "" },
        cpt_codes: { value: "Not applicable", note: "depends on services rendered" },
        notes: "Confirm the diagnosis is the primary reason for this home health episode of care.",
      },
      {
        scenario: "COPD with acute exacerbation",
        mmta_categorization: "MMTA - Respiratory",
        icd_codes: { value: "J44.1", note: "" },
        cpt_codes: { value: "Not applicable", note: "depends on services rendered" },
        notes: "Verify a recent hospitalization or ER visit supports the exacerbation.",
      },
      {
        scenario: "Type 2 diabetes with complications",
        mmta_categorization: "MMTA - Endocrine",
        icd_codes: { value: "E11.9", note: "add complication code if documented" },
        cpt_codes: { value: "Not applicable", note: "" },
        notes: "Check for documented complications to assign a more specific code.",
      },
      {
        scenario: "Post-surgical wound care after hip replacement",
        mmta_categorization: "MMTA - Surgical Aftercare",
        icd_codes: { value: "Z47.1", note: "aftercare following joint replacement" },
        cpt_codes: { value: "Not applicable", note: "" },
        notes: "Use the aftercare code, not the original injury code, once surgery is complete.",
      },
    ],
    additional_guidance: [
      { label: "ICD Codes", text: "Always code to the highest level of specificity supported by documentation." },
      {
        label: "Blank Diagnosis",
        text: 'If the diagnosis column is blank, review the referral and recent clinical notes before defaulting to "MMTA - Other."',
      },
    ],
    action: "Confirm the principal diagnosis with the referring physician's documentation before finalizing the MMTA category.",
    summary:
      "MMTA categorization is driven by the principal diagnosis — when it's missing, don't guess; verify against the clinical record first.",
  },
  response: "*(markdown fallback — not shown, the structured view above is used instead)*",
  cached: true,
  persisted: true,
  document_signature: "3d48c80a1f2e4b9c8d7a6f5e4d3c2b1a0f9e8d7c",
  document_count: 2,
  generated_at: "2026-08-31T11:00:00+00:00",
};
