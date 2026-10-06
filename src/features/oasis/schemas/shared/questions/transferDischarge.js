import { FIELD_WIDGETS as W } from "../../../engine/schema";
import { coded, checks, opts } from "./helpers";

// Items asked only at transfer or discharge (TRN, DC).

export const m2301 = (fieldId, extra = {}) =>
  coded(
    "M2301",
    fieldId,
    "Emergent Care — Since the most recent SOC/ROC, has the patient utilized a hospital emergency department (includes holding/observation status)?",
    [
      ["0", "No → Skip to M2410, Inpatient Facility"],
      ["1", "Yes, used ED WITHOUT hospital admission"],
      ["2", "Yes, used ED WITH hospital admission"],
      ["UK", "Unknown → Skip to M2410"],
    ],
    extra
  );

// keys in order: medication, hypo/hyperglycemia, other, unknown.
export const m2310 = (keys) =>
  checks(
    "M2310",
    "Reason for Emergent Care — For what reason(s) did the patient seek emergent care?",
    keys,
    [
      "1. Improper medication administration, adverse drug reactions, side effects, toxicity, anaphylaxis",
      "10. Hypo/Hyperglycemia, diabetes out of control",
      "19. Other than above reasons",
      "UK. Reason unknown",
    ],
    { description: "Check all that apply" }
  );

export const m2410 = (fieldId, { withNA = false, ...extra } = {}) =>
  coded(
    "M2410",
    fieldId,
    "To which Inpatient Facility has the patient been admitted?",
    [
      ["1", "Hospital"],
      ["2", "Rehabilitation facility"],
      ["3", "Nursing home"],
      ["4", "Hospice"],
      ...(withNA ? [["NA", "No inpatient facility admission"]] : []),
    ],
    extra
  );

export const m2420 = (fieldId, extra = {}) =>
  coded(
    "M2420",
    fieldId,
    "Discharge Disposition — Where is the patient after discharge from your agency? (Choose only one answer.)",
    [
      ["1", "Patient remained in the community (without skilled services from a Medicare Certified HHA or non-institutional hospice) → Skip to A2123"],
      ["2", "Patient remained in the community (with skilled services from a Medicare Certified HHA) → Continue to A2121"],
      ["3", "Patient transferred to a non-institutional hospice → Continue to A2121"],
      ["4", "Unknown because patient moved to a geographic location not served by this agency → Skip to A2123"],
      ["UK", "Other unknown → Skip to A2123"],
    ],
    extra
  );

export const a2121 = (fieldId, extra = {}) =>
  coded(
    "A2121",
    fieldId,
    "Provision of Current Reconciled Medication List to Subsequent Provider at Discharge",
    [
      ["0", "No — Skip to B1300"],
      ["1", "Yes — Continue to A2122"],
    ],
    {
      description:
        "At the time of discharge to another provider, did your agency provide the patient's current reconciled medication list to the subsequent provider?",
      ...extra,
    }
  );

export const a2123 = (fieldId, extra = {}) =>
  coded(
    "A2123",
    fieldId,
    "Provision of Current Reconciled Medication List to Patient at Discharge",
    [
      ["0", "No — Skip to B1300"],
      ["1", "Yes — Continue to A2124"],
    ],
    {
      description:
        "At the time of discharge, did your agency provide the patient's current reconciled medication list to the patient, family, or caregiver?",
      ...extra,
    }
  );

// keys in order A–E.
export const a2124 = (keys) =>
  checks(
    "A2124",
    "Route of Current Reconciled Medication List Transmission to Patient",
    keys,
    [
      "A. Electronic Health Record",
      "B. Health Information Exchange",
      "C. Verbal (in-person, telephone, video conferencing)",
      "D. Paper-based (fax, copies, printouts)",
      "E. Other Methods (texting, email, CDs)",
    ],
    { description: "Check all that apply" }
  );

export const a2120 = (fieldId, extra = {}) =>
  coded(
    "A2120",
    fieldId,
    "Provision of Current Reconciled Medication List to Subsequent Provider at Transfer",
    [
      ["0", "No — list not provided → Skip to J1800"],
      ["1", "Yes — list provided → Continue to A2122"],
      ["2", "NA — agency not made aware of transfer timely → Skip to J1800"],
    ],
    extra
  );

// keys in order A–E.
export const a2122 = (keys) =>
  checks(
    "A2122",
    "Route of Current Reconciled Medication List Transmission to Subsequent Provider",
    keys,
    [
      "A. Electronic Health Record",
      "B. Health Information Exchange",
      "C. Verbal (in-person, telephone, video conferencing)",
      "D. Paper-based (fax, copies, printouts)",
      "E. Other Methods (texting, email, CDs)",
    ],
    { description: "Check all that apply" }
  );

export const m1041 = (fieldId, extra = {}) =>
  coded(
    "M1041",
    fieldId,
    "Influenza Vaccine Data Collection Period — Does this episode of care (SOC/ROC to Transfer/Discharge) include any dates on or between October 1 and March 31?",
    [
      ["0", "No → Skip to M2401, Intervention Synopsis"],
      ["1", "Yes → Continue to M1046"],
    ],
    extra
  );

export const m1046 = (fieldId, extra = {}) =>
  coded(
    "M1046",
    fieldId,
    "Influenza Vaccine Received — Did the patient receive the influenza vaccine for this year’s flu season?",
    [
      ["1", "Yes; received from your agency during this episode of care"],
      ["2", "Yes; received from your agency during a prior episode of care"],
      ["3", "Yes; received from another health care provider"],
      ["4", "No; patient offered and declined"],
      ["5", "No; patient assessed, has medical contraindication(s)"],
      ["6", "No; not indicated — patient does not meet age/condition guidelines"],
      ["7", "No; inability to obtain vaccine due to declared shortage"],
      ["8", "No; patient did not receive for reasons other than 4-7"],
    ],
    extra
  );

const M2401_ROWS = [
  ["b. Falls prevention interventions", "Every standardized, validated multi-factor fall risk assessment since the most recent SOC/ROC indicates the patient has no risk for falls."],
  ["c. Depression intervention(s)", "Patient has no diagnosis of depression AND every validated depression screening indicates no symptoms, or some symptoms but not meeting criteria for further evaluation."],
  ["d. Intervention(s) to monitor and mitigate pain", "Every standardized, validated pain assessment since the most recent SOC/ROC indicates the patient has no pain."],
  ["e. Intervention(s) to prevent pressure ulcers", "Every validated pressure ulcer risk assessment indicates the patient is not at risk of developing pressure ulcers."],
  ["f. Pressure ulcer treatment based on moist wound healing", "Patient has no pressure ulcers OR none for which moist wound healing is indicated."],
];

// keys in order b–f.
export const m2401 = (keys) => ({
  itemCode: "M2401",
  label: "Intervention Synopsis",
  description:
    "At the time of or since the most recent SOC/ROC, were the following interventions BOTH included in the physician-ordered plan of care AND implemented? Mark one box per row.",
  widget: W.RADIO_TABLE,
  rowHeader: "Plan / Intervention",
  options: opts([
    ["0", "No (0)"],
    ["1", "Yes (1)"],
    ["NA", "NA"],
  ]),
  radioRows: M2401_ROWS.map(([label, description], i) => ({ fieldId: keys[i], label, description })),
});
