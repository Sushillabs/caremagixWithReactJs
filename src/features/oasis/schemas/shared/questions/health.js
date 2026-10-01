import { FIELD_WIDGETS as W } from "../../../engine/schema";
import { coded, checks, numeric } from "./helpers";

// rows: [{ icdFieldId, severityFieldId }] in order Primary, b, c, d, e, f.
export const diagnoses = (rows) => {
  const labels = [
    ["M1021. Primary Diagnosis", "V, W, X, Y codes NOT allowed"],
    ["M1023b. Other Diagnosis", "All ICD-10-CM codes allowed"],
    ["M1023c. Other Diagnosis"],
    ["M1023d. Other Diagnosis"],
    ["M1023e. Other Diagnosis"],
    ["M1023f. Other Diagnosis"],
  ];
  return {
    itemCode: "M1021 / M1023",
    label: "Primary Diagnosis & Other Diagnoses",
    description:
      "Sequencing of diagnoses should reflect the seriousness of each condition and support the disciplines and services provided. Severity rating: 0=Asymptomatic, no treatment needed, 1=Symptoms controlled with difficulty, affecting daily functioning, 2=Symptoms controlled with difficulty, affecting daily functioning, 3=Symptoms poorly controlled, patient needs frequent adjustment in treatment, 4=Symptoms poorly controlled; history of re-hospitalizations.",
    widget: W.DIAGNOSIS_TABLE,
    severityLabel: "Symptom Control Rating (0–4)",
    diagnosisRows: rows.map((row, i) => ({ label: labels[i][0], note: labels[i][1], ...row })),
  };
};

export const m1028 = (keys) =>
  checks(
    "M1028",
    "Active Diagnoses — Comorbidities and Co-existing Conditions",
    keys,
    [
      "1. Peripheral Vascular Disease (PVD) or Peripheral Arterial Disease (PAD)",
      "2. Diabetes Mellitus (DM)",
      "3. None of the above",
    ],
    { description: "Check all that apply." }
  );

export const m1033 = (keys) =>
  checks(
    "M1033",
    "Risk for Hospitalization",
    keys,
    [
      "1. History of falls (2 or more falls — or any fall with an injury — in the past 12 months)",
      "2. Unintentional weight loss of a total of 10 pounds or more in the last 12 months",
      "3. Multiple hospitalizations (2 or more) in the past 6 months",
      "4. Multiple emergency department visits (2 or more) in the past 6 months",
      "5. Decline in mental, emotional, or behavioral status in the past 3 months",
      "6. Reported or observed history of difficulty complying with any medical instructions (e.g., medications, diet, exercise) in the past 3 months",
      "7. Currently taking 5 or more medications",
      "8. Currently reports exhaustion",
      "9. Other risk(s) not listed in 1–8",
      "10. None of the above",
    ],
    {
      description:
        "Which of the following signs or symptoms characterize this patient as at risk for hospitalization? Check all that apply.",
      layout: "two-col",
    }
  );

export const j0510 = (fieldId) =>
  coded(
    "J0510",
    fieldId,
    "Pain Effect on Sleep",
    [
      ["0", "Does not apply — I have not had any pain or hurting in the past 5 days → Skip to M1400"],
      ["1", "Rarely or not at all"],
      ["2", "Occasionally"],
      ["3", "Frequently"],
      ["4", "Almost constantly"],
      ["8", "Unable to answer"],
    ],
    {
      description:
        'Ask patient: "Over the past 5 days, how much of the time has pain made it hard for you to sleep at night?"',
    }
  );

export const j0520 = (fieldId) =>
  coded(
    "J0520",
    fieldId,
    "Pain Interference with Therapy Activities",
    [
      ["0", "Does not apply — I have not received rehabilitation therapy in the past 5 days"],
      ["1", "Rarely or not at all"],
      ["2", "Occasionally"],
      ["3", "Frequently"],
      ["4", "Almost constantly"],
      ["8", "Unable to answer"],
    ],
    {
      description:
        'Ask patient: "Over the past 5 days, how often have you limited your participation in rehabilitation therapy sessions due to pain?"',
    }
  );

export const j0530 = (fieldId) =>
  coded(
    "J0530",
    fieldId,
    "Pain Interference with Day-to-Day Activities",
    [
      ["1", "Rarely or not at all"],
      ["2", "Occasionally"],
      ["3", "Frequently"],
      ["4", "Almost constantly"],
      ["8", "Unable to answer"],
    ],
    {
      description:
        'Ask patient: "Over the past 5 days, how often you have limited your day-to-day activities (excluding rehabilitation therapy sessions) because of pain?"',
    }
  );

export const m1400 = (fieldId) =>
  coded("M1400", fieldId, "When is the patient dyspneic or noticeably Short of Breath?", [
    ["0", "Patient is not short of breath"],
    ["1", "When walking more than 20 feet, climbing stairs"],
    ["2", "With moderate exertion (e.g., while dressing, using commode or bedpan, walking distances less than 20 feet)"],
    ["3", "With minimal exertion (e.g., while eating, talking, or performing other ADLs) or with agitation"],
    ["4", "At rest (during day or night)"],
  ]);

export const m1060Height = (fieldId) =>
  numeric("M1060A", fieldId, "Height (inches) — most recent since SOC/ROC", { min: 0, max: 120 }, {
    description: "While measuring, if the number is X.1–X.4 round down; X.5 or greater round up.",
    placeholder: "in.",
    unit: "inches",
  });

export const m1060Weight = (fieldId) =>
  numeric("M1060B", fieldId, "Weight (pounds) — most recent in last 30 days", { min: 0, max: 999 }, {
    description: "While measuring, if the number is X.1–X.4 round down; X.5 or greater round up.",
    placeholder: "lbs.",
    unit: "pounds",
  });

export const k0520 = (keys, { label, description }) =>
  checks(
    "K0520",
    label,
    keys,
    [
      "A. Parenteral/IV feeding",
      "B. Feeding tube (e.g., nasogastric or abdominal (PEG))",
      "C. Mechanically altered diet — require change in texture of food or liquids (e.g., pureed food, thickened liquids)",
      "D. Therapeutic diet (e.g., low salt, diabetic, low cholesterol)",
      "Z. None of the above",
    ],
    { description }
  );

export const m1870 = (fieldId) =>
  coded(
    "M1870",
    fieldId,
    "Feeding or Eating",
    [
      ["0", "Able to independently feed self."],
      ["1", "Able to feed self independently but requires: a) meal set-up; OR b) intermittent assistance or supervision; OR c) a liquid, pureed, or ground meat diet."],
      ["2", "Unable to feed self and must be assisted or supervised throughout the meal/snack."],
      ["3", "Able to take in nutrients orally and receives supplemental nutrients through a nasogastric tube or gastrostomy."],
      ["4", "Unable to take in nutrients orally and is fed nutrients through a nasogastric tube or gastrostomy."],
      ["5", "Unable to take in nutrients orally or by tube feeding."],
    ],
    {
      description:
        "Current ability to feed self meals and snacks safely. Note: This refers only to the process of eating, chewing, and swallowing, not preparing the food to be eaten.",
    }
  );
