import { FIELD_WIDGETS as W } from "../../../engine/schema";
import { coded, checks } from "./helpers";

export const m1306 = (fieldId) =>
  coded(
    "M1306",
    fieldId,
    "Does this patient have at least one Unhealed Pressure Ulcer/Injury at Stage 2 or Higher or designated as Unstageable?",
    [
      ["0", "No → Skip to M1322"],
      ["1", "Yes"],
    ]
  );

// keys in order A1, B1, C1, D1, E1, F1.
export const m1311 = (keys) => ({
  itemCode: "M1311",
  label: "Current Number of Unhealed Pressure Ulcers/Injuries at Each Stage",
  widget: W.COUNT_GRID,
  range: { min: 0 },
  rows: [
    "A1. Stage 2 count",
    "B1. Stage 3 count",
    "C1. Stage 4 count",
    "D1. Unstageable (non-removable dressing)",
    "E1. Unstageable (slough/eschar)",
    "F1. Unstageable (deep tissue injury)",
  ].map((label, i) => ({ fieldId: keys[i], itemCode: keys[i], label })),
});

export const m1322 = (fieldId) =>
  coded(
    "M1322",
    fieldId,
    "Current Number of Stage 1 Pressure Injuries",
    [
      ["0", "Zero"],
      ["1", "One"],
      ["2", "Two"],
      ["3", "Three"],
      ["4", "Four or more"],
    ],
    {
      description:
        "Intact skin with non-blanchable redness of a localized area usually over a bony prominence.",
    }
  );

export const m1324 = (fieldId) =>
  coded(
    "M1324",
    fieldId,
    "Stage of Most Problematic Unhealed Pressure Ulcer/Injury that is Stageable",
    [
      ["1", "Stage 1"],
      ["2", "Stage 2"],
      ["3", "Stage 3"],
      ["4", "Stage 4"],
      ["NA", "Patient has no pressure ulcers/injuries or no stageable pressure ulcers/injuries"],
    ],
    { maxLength: 2 }
  );

export const m1330 = (fieldId) =>
  coded("M1330", fieldId, "Does this patient have a Stasis Ulcer?", [
    ["0", "No → Skip to M1340"],
    ["1", "Yes, patient has BOTH observable and unobservable stasis ulcers"],
    ["2", "Yes, patient has observable stasis ulcers ONLY"],
    ["3", "Yes, patient has unobservable stasis ulcers ONLY → Skip to M1340"],
  ]);

export const m1332 = (fieldId) =>
  coded("M1332", fieldId, "Current Number of Stasis Ulcer(s) that are Observable", [
    ["1", "One"],
    ["2", "Two"],
    ["3", "Three"],
    ["4", "Four or more"],
  ]);

export const m1334 = (fieldId) =>
  coded("M1334", fieldId, "Status of Most Problematic Stasis Ulcer that is Observable", [
    ["1", "Fully granulating"],
    ["2", "Early/partial granulation"],
    ["3", "Not healing"],
  ]);

export const m1340 = (fieldId) =>
  coded("M1340", fieldId, "Does this patient have a Surgical Wound?", [
    ["0", "No → Skip to N0415"],
    ["1", "Yes, patient has at least one observable surgical wound"],
    ["2", "Surgical wound known but not observable due to non-removable dressing/device → Skip to N0415"],
  ]);

export const m1342 = (fieldId) =>
  coded("M1342", fieldId, "Status of Most Problematic Surgical Wound that is Observable", [
    ["0", "Newly epithelialized"],
    ["1", "Fully granulating"],
    ["2", "Early/partial granulation"],
    ["3", "Not healing"],
  ]);

const DRUG_CLASSES = [
  ["A", "A. Antipsychotic"],
  ["E", "E. Anticoagulant"],
  ["F", "F. Antibiotic"],
  ["H", "H. Opioid"],
  ["I", "I. Antiplatelet"],
  ["J", "J. Hypoglycemic (including insulin)"],
];

// keyFor(letter, "take" | "ind") for each drug class; noneKey is the single "Z" box.
export const n0415 = (keyFor, noneKey) => ({
  itemCode: "N0415",
  label: "High-Risk Drug Classes: Use and Indication",
  description: "Column 1 = Is taking. Column 2 = Indication noted (if Column 1 is checked).",
  widget: W.CHECKBOX_TABLE,
  rowHeader: "Drug Class",
  columns: [{ label: "1. Is Taking" }, { label: "2. Indication Noted" }],
  tableRows: [
    ...DRUG_CLASSES.map(([letter, label]) => ({
      label,
      fieldIds: [keyFor(letter, "take"), keyFor(letter, "ind")],
    })),
    { label: "Z. None of the above", fieldIds: [noneKey, null] },
  ],
});

export const m2001 = (fieldId) =>
  coded(
    "M2001",
    fieldId,
    "Drug Regimen Review",
    [
      ["0", "No — No issues found during review → Skip to M2010"],
      ["1", "Yes — Issues found during review"],
      ["9", "NA — Patient is not taking any medications → Skip to O0110"],
    ],
    {
      description:
        "Did a complete drug regimen review identify potential clinically significant medication issues?",
    }
  );

export const m2003 = (fieldId) =>
  coded(
    "M2003",
    fieldId,
    "Medication Follow-up",
    [
      ["0", "No"],
      ["1", "Yes"],
    ],
    {
      description:
        "Did the agency contact a physician (or physician-designee) by midnight of the next calendar day and complete prescribed/recommended actions in response to the identified potential clinically significant medication issues?",
    }
  );

export const m2010 = (fieldId) =>
  coded(
    "M2010",
    fieldId,
    "Patient/Caregiver High-Risk Drug Education",
    [
      ["0", "No"],
      ["1", "Yes"],
      ["NA", "Patient not taking any high-risk drugs OR patient/caregiver fully knowledgeable about special precautions"],
    ],
    {
      description:
        "Has the patient/caregiver received instruction on special precautions for all high-risk medications (such as hypoglycemics, anticoagulants, etc.) and how and when to report problems that may occur?",
    }
  );

export const m2020 = (fieldId) =>
  coded(
    "M2020",
    fieldId,
    "Management of Oral Medications",
    [
      ["0", "Able to independently take the correct oral medication(s) and proper dosage(s) at the correct times."],
      ["1", "Able to take medication(s) at the correct times if: a) individual dosages are prepared in advance; OR b) another person develops a drug diary or chart."],
      ["2", "Able to take medication(s) at the correct times if given reminders by another person at the appropriate times."],
      ["3", "Unable to take medication unless administered by another person."],
      ["NA", "No oral medications prescribed."],
    ],
    {
      description:
        "Patient's current ability to prepare and take all oral medications reliably and safely. (NOTE: This refers to ability, not compliance or willingness.)",
      maxLength: 2,
    }
  );

export const m2030 = (fieldId) =>
  coded(
    "M2030",
    fieldId,
    "Management of Injectable Medications",
    [
      ["0", "Able to independently take the correct medication(s) and proper dosage(s) at the correct times."],
      ["1", "Able to take injectable medication(s) at the correct times if: a) individual syringes are prepared in advance; OR b) another person develops a drug diary or chart."],
      ["2", "Able to take medication(s) at the correct times if given reminders by another person based on the frequency of the injection."],
      ["3", "Unable to take injectable medication unless administered by another person."],
      ["NA", "No injectable medications prescribed."],
    ],
    {
      description:
        "Patient's current ability to prepare and take all prescribed injectable medications reliably and safely, including administration of the correct dosage at the appropriate times/intervals. Excludes IV medications.",
      maxLength: 2,
    }
  );

const SPECIAL_TREATMENTS = [
  ["A1", "A1. Chemotherapy", "Cancer Treatments"],
  ["A2", "A2. IV"],
  ["A3", "A3. Oral"],
  ["A10", "A10. Other"],
  ["B1", "B1. Radiation"],
  ["C1", "C1. Oxygen Therapy", "Respiratory Therapies"],
  ["C2", "C2. Continuous"],
  ["C3", "C3. Intermittent"],
  ["C4", "C4. High-concentration"],
  ["D1", "D1. Suctioning"],
  ["D2", "D2. Scheduled"],
  ["D3", "D3. As Needed"],
  ["E1", "E1. Tracheostomy care"],
  ["F1", "F1. Invasive Mechanical Ventilator"],
  ["G1", "G1. Non-invasive Mechanical Ventilator"],
  ["G2", "G2. BiPAP"],
  ["G3", "G3. CPAP"],
  ["H1", "H1. IV Medications", "Other Treatments"],
  ["H2", "H2. Vasoactive medications"],
  ["H3", "H3. Antibiotics"],
  ["H4", "H4. Anticoagulation"],
  ["H10", "H10. Other"],
  ["I1", "I1. Transfusions"],
  ["J1", "J1. Dialysis"],
  ["J2", "J2. Hemodialysis"],
  ["J3", "J3. Peritoneal dialysis"],
  ["O1", "O1. IV Access"],
  ["O2", "O2. Peripheral"],
  ["O3", "O3. Mid-line"],
  ["O4", "O4. Central (e.g., PICC, tunneled, port)"],
  ["Z1", "Z1. None of the Above"],
];

// keyFor maps the CMS sub-item code ("A1") to this form's field key.
export const o0110 = (keyFor, { label, description }) =>
  checks(
    "O0110",
    label,
    SPECIAL_TREATMENTS.map(([code]) => keyFor(code)),
    SPECIAL_TREATMENTS.map(([, text, groupLabel]) => (groupLabel ? [text, groupLabel] : text)),
    { description, layout: "grid-3" }
  );
