import painBodyMap from "./images/pain-body-map.png";
import skinBodyMap from "./images/skin-body-map.png";
import fallRiskAlgorithm from "./images/fall-risk-algorithm.png";

export const AGENCY_KEY = "agency_assessment";

const row = (key, label, extra = {}) => ({ key, label, ...extra });
const check = (key, label, details) => ({ key, label, ...(details ? { details } : {}) });
const input = (key, label, extra = {}) => ({ key, label, ...extra });
const opt = (value, label, description) => ({ value, label, ...(description ? { description } : {}) });
const choiceRow = (key, label, options, detail) => ({ key, label, options, ...(detail ? { detail } : {}) });

const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
const supplyGroup = (group, title, labels) => ({
  type: "checks",
  title,
  items: [
    ...labels.map((label) => check(`${group}_${slug(label)}`, label)),
    check(`${group}_other`, "Other", [{ key: `${group}_other_detail`, placeholder: "Specify" }]),
  ],
});
const YES_NO = [
  ["yes", "Yes"],
  ["no", "No"],
];
const YES_NO_NA = [...YES_NO, ["na", "NA"]];

const cmsCode = (value) => {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
};
const sumScores = (values, keys) => {
  const scores = keys.map((key) => cmsCode(values[key]));
  return scores.includes(null) ? null : scores.reduce((a, b) => a + b, 0);
};
const countChecked = (values, keys) => keys.filter((key) => values[key] === true).length;

const BRADEN_KEYS = ["sensory", "moisture", "activity", "mobility", "nutrition", "friction_shear"];
const FALL_SCORE_KEYS = ["consciousness", "falls_history", "ambulation", "vision", "orthostatic", "medications", "diseases"];
const GAIT_PROBLEM_KEYS = ["gait_balance_standing", "gait_balance_walking", "gait_coordination", "gait_doorway", "gait_turns", "gait_assistance"];
const EQUIPMENT_KEYS = ["equipment_oxygen", "equipment_device_use", "equipment_needs", "equipment_other"];

function fallRiskTotal(values) {
  const base = sumScores(values, FALL_SCORE_KEYS);
  if (base === null) return null;
  return base + countChecked(values, GAIT_PROBLEM_KEYS) + (values.medication_change === true ? 1 : 0) + countChecked(values, EQUIPMENT_KEYS);
}
const isHighFallRisk = (values) => (fallRiskTotal(values) ?? 0) >= 10;

export const AGENCY_SECTIONS = [
  {
    id: "neuro",
    label: "Neuro Function",
    blocks: [
      {
        type: "yesNo",
        title: "History / Signs & Symptoms",
        rows: [
          row("cva", "CVA"),
          row("tia", "TIA(s)"),
          row("seizure_disorder", "Seizure Disorder"),
          row("dizziness", "Dizziness"),
          row("vertigo", "Vertigo"),
          row("syncope", "Syncope"),
          row("falls", "Fall(s)"),
          row("paralysis_paresis", "Paralysis/Paresis", { specify: "Specify" }),
          row("amputation", "Amputation", { specify: "Specify" }),
          row("contractures", "Contracture(s)"),
          row("unequal_grasp", "Unequal Grasp"),
          row("comatose", "Comatose"),
          row("parkinsons", "Parkinson's"),
          row("ms", "MS"),
          row("other_autoimmune", "Other Auto-Immune Disease", { specify: "Disease" }),
          row("headache", "Headache"),
          row("numbness_tingling", "Numbness/Tingling"),
          row("tremors", "Tremors"),
          row("pearl", "PEARL"),
          row("oriented_x3", "Oriented x 3"),
          row("affect_appropriate", "Affect Appropriate"),
          row("aphasia", "Aphasia/Inarticulate Speech"),
          row("arthritis", "Arthritis"),
          row("swollen_stiff_joints", "Swollen/Stiff Joints"),
        ],
      },
      {
        type: "yesNo",
        title: "Vision",
        rows: [
          row("glasses_contacts", "Glasses/Contacts"),
          row("glaucoma", "Glaucoma"),
          row("cataracts", "Cataracts"),
          row("surgery", "Surgery"),
          row("legally_blind", "Legally Blind", { sides: true }),
          row("totally_blind", "Totally Blind", { sides: true }),
        ],
      },
      {
        type: "yesNo",
        title: "Hearing",
        rows: [
          row("hoh", "HOH", { sides: true }),
          row("hearing_aid", "Hearing Aid", { sides: true }),
          row("deaf", "Deaf", { sides: true }),
          row("other_1", "Other", { specify: "Specify" }),
          row("other_2", "Other", { specify: "Specify" }),
        ],
      },
    ],
  },
  {
    id: "cardiovascular",
    label: "Cardiovascular",
    blocks: [
      {
        type: "checks",
        items: [
          check("chest_pain", "Chest Pain"),
          check("palpitations", "Palpitations"),
          check("tachycardia", "Tachycardia"),
          check("diaphoresis", "Diaphoresis"),
          check("dizziness", "Dizziness"),
          check("fainting", "Fainting"),
          check("calf_tenderness", "Calf Tenderness"),
          check("peripheral_pulses", "Peripheral Pulses"),
          check("edema", "Edema", [
            { key: "edema_grade", placeholder: "Grade", options: ["1+", "2+", "3+", "4+"] },
            { key: "edema_location", placeholder: "Location" },
          ]),
        ],
      },
      {
        type: "inputs",
        title: "Measurements (cm)",
        items: [
          input("rc_cm", "RC", { numeric: true }),
          input("lc_cm", "LC", { numeric: true }),
          input("ra_cm", "RA", { numeric: true }),
          input("la_cm", "LA", { numeric: true }),
          input("rl_cm", "RL", { numeric: true }),
          input("ll_cm", "LL", { numeric: true }),
        ],
      },
      { type: "notes", key: "describe", label: "Describe" },
    ],
  },
  {
    id: "respiratory",
    label: "Respiratory",
    hint: "M1400 (Short of Breath) is a CMS item — fill it in the J · Health Cond. tab.",
    blocks: [
      {
        type: "checks",
        items: [
          check("suctioning", "Suctioning"),
          check("sputum", "Sputum"),
          check("rales", "Rales"),
          check("cough", "Cough"),
          check("diminished", "Diminished"),
          check("tachypnea", "Tachypnea"),
          check("rhonchi", "Rhonchi", [{ key: "rhonchi_detail", placeholder: "Details" }]),
          check("cyanosis_pallor", "Cyanosis/Pallor"),
          check("trach", "Trach"),
          check("orthopnea", "Orthopnea"),
          check("oxygen", "Oxygen", [{ key: "oxygen_flow_lpm", placeholder: "Flow (lpm)", numeric: true }]),
          check("sob_rest", "SOB at Rest"),
          check("stridor", "Stridor"),
          check("soboe", "SOBOE"),
          check("pulmoaide", "Pulmoaide", [{ key: "pulmoaide_detail", placeholder: "Details" }]),
          check("o2_sat", "O2 Sat", [{ key: "o2_sat_value", placeholder: "%", numeric: true }]),
        ],
      },
      { type: "notes", key: "describe", label: "Describe" },
    ],
  },
  {
    id: "nutrition",
    label: "Nutrition",
    blocks: [
      {
        type: "inputs",
        items: [input("diet", "Diet"), input("appetite", "Appetite"), input("anorexia", "Anorexia")],
      },
      {
        type: "checks",
        items: [
          check("dysphagia", "Dysphagia"),
          check("nausea", "Nausea"),
          check("dehydration", "Dehydration"),
          check("other", "Other", [{ key: "other_detail", placeholder: "Specify" }]),
        ],
      },
    ],
  },
  {
    id: "vitals",
    label: "Vital Signs / Physical Assessment",
    blocks: [
      {
        type: "inputs",
        items: [
          input("temperature", "Temp (°F)", { numeric: true }),
          input("pulse", "Pulse", { numeric: true }),
          input("respirations", "Resp.", { numeric: true }),
        ],
      },
      {
        type: "inputs",
        title: "Blood Pressure",
        items: [
          input("bp_sitting_right", "Sitting — R", { placeholder: "120/80" }),
          input("bp_sitting_left", "Sitting — L", { placeholder: "120/80" }),
          input("bp_standing_right", "Standing — R", { placeholder: "120/80" }),
          input("bp_standing_left", "Standing — L", { placeholder: "120/80" }),
          input("bp_lying_right", "Lying — R", { placeholder: "120/80" }),
          input("bp_lying_left", "Lying — L", { placeholder: "120/80" }),
        ],
      },
      {
        type: "inputs",
        items: [input("height", "Height", { placeholder: "e.g. 5 ft 6 in" }), input("weight_lbs", "Weight (lbs)", { numeric: true })],
      },
      {
        type: "inputs",
        title: "Recent Weight Loss",
        items: [
          input("weight_loss_lbs", "Lbs", { numeric: true }),
          input("weight_loss_weeks", "In weeks", { numeric: true }),
          input("weight_loss_months", "In months", { numeric: true }),
        ],
      },
    ],
  },
  {
    id: "pain",
    label: "Pain Assessment",
    blocks: [
      {
        type: "image",
        title: "I. Location",
        src: painBodyMap,
        alt: "Body diagram: front, right side, back, left side, head and feet",
        caption: "Write the location below.",
      },
      {
        type: "inputs",
        wide: true,
        items: [input("location", "Location (where it hurts)", { placeholder: "Lower back, right knee" })],
      },
      {
        type: "inputs",
        title: "II. Intensity",
        items: [
          input("scale_used", "Scale used", { placeholder: "0-10" }),
          input("present", "Present"),
          input("worst", "Worst pain gets"),
          input("best", "Best pain gets"),
          input("acceptable", "Acceptable level of pain"),
        ],
      },
      {
        type: "inputs",
        wide: true,
        items: [
          input("quality", "III. Quality (patient's own words, e.g. prick, ache, throb, pull, sharp)"),
          input("onset_duration", "IV. Onset, duration, variations, rhythms"),
          input("expressing", "V. Manner of expressing pain"),
          input("relieves", "VI. What relieves the pain?"),
          input("increases", "VII. What causes or increases the pain?"),
        ],
      },
      {
        type: "inputs",
        title: "VIII. Effects of pain",
        items: [
          input("accompanying_symptoms", "Accompanying symptoms (e.g. nausea)"),
          input("sleep", "Sleep"),
          input("appetite", "Appetite"),
          input("physical", "Physical"),
          input("activity", "Activity"),
          input("relationships", "Relationship with others (e.g. irritability)"),
          input("emotions", "Emotions (e.g. anger, suicidal, crying)"),
          input("concentration", "Concentration"),
          input("effects_other", "Other"),
        ],
      },
      { type: "notes", key: "other_comments", label: "IX. Other comments" },
      { type: "notes", key: "plan", label: "X. Plan" },
    ],
  },
  {
    id: "integumentary",
    label: "Integumentary Status",
    blocks: [
      {
        type: "checks",
        title: "History",
        items: [
          check("eczema_psoriasis", "Eczema/Psoriasis"),
          check("cancer", "Cancer", [{ key: "cancer_location", placeholder: "Location" }]),
          check("shingles", "Shingles", [{ key: "shingles_location", placeholder: "Location" }]),
          check("history_other", "Other", [{ key: "history_other_detail", placeholder: "Specify" }]),
        ],
      },
      {
        type: "checks",
        title: "Complains of",
        items: [
          check("itching", "Itching", [{ key: "itching_location", placeholder: "Location" }]),
          check("rash", "Rash", [{ key: "rash_location", placeholder: "Location" }]),
          check("sores_not_healing", "Sores that won't heal", [{ key: "sores_location", placeholder: "Location" }]),
          check("wart_mole_changes", "Obvious changes in wart or mole", [{ key: "wart_mole_location", placeholder: "Location" }]),
          check("alopecia", "Alopecia"),
        ],
      },
      { type: "choice", key: "skin_turgor", label: "Skin Turgor", options: [
          ["good", "Good"],
          ["fair", "Fair"],
          ["poor", "Poor"],
        ] },
      {
        type: "checks",
        items: [
          check("skin_intact", "Skin integrity intact; no closed, primary or secondary lesions"),
          check("skin_impaired", "Impaired skin integrity (type and location below)"),
        ],
      },
      {
        type: "image",
        title: "Location",
        src: skinBodyMap,
        alt: "Body diagram: front and back",
        caption: "Write size and location in the table below.",
      },
      {
        type: "inputs",
        title: "Type / Size / Location",
        pairs: true,
        items: [
          ...[
            ["lesion", "1. Lesion"],
            ["bruises", "2. Bruises"],
            ["scars", "3. Scars"],
            ["pressure_sore", "4a. Wound — Pressure sore(s)"],
            ["stasis_ulcer", "4b. Wound — Stasis ulcer(s)"],
            ["surgical_incision", "4c. Wound — Surgical incision(s)"],
          ].flatMap(([key, label]) => [
            input(`${key}_size`, `${label} — size`, { placeholder: "2 x 3 cm" }),
            input(`${key}_location`, `${label} — location`, { placeholder: "Left forearm" }),
          ]),
        ],
      },
      {
        type: "inputs",
        items: [
          input("other_type", "5. Other (specify)"),
          input("other_size", "5. Other — size", { placeholder: "2 x 3 cm" }),
          input("other_location", "5. Other — location", { placeholder: "Left forearm" }),
        ],
      },
    ],
  },
  {
    id: "braden",
    label: "Braden Scale (Pressure Sore Risk)",
    hint: "Perform on admission, quarterly, after major change and after return from hospital.",
    blocks: [
      { type: "inputs", items: [input("assessment_date", "Date of assessment", { date: true })] },
      {
        type: "score",
        rows: [
          {
            key: "sensory",
            label: "Sensory Perception",
            options: [
              opt("1", "Completely Limited", "Unresponsive to painful stimuli, or limited ability to feel pain over most of body."),
              opt("2", "Very Limited", "Responds only to painful stimuli, or sensory impairment over half of body."),
              opt("3", "Slightly Limited", "Responds to verbal commands but cannot always communicate discomfort, or impairment in 1–2 extremities."),
              opt("4", "No Impairment", "Responds to verbal commands; no sensory deficit."),
            ],
          },
          {
            key: "moisture",
            label: "Moisture",
            options: [
              opt("1", "Constantly Moist", "Skin kept moist almost constantly; dampness every time patient is moved."),
              opt("2", "Very Moist", "Skin often moist; linen changed at least once a shift."),
              opt("3", "Occasionally Moist", "Extra linen change about once a day."),
              opt("4", "Rarely Moist", "Skin usually dry; routine linen changes only."),
            ],
          },
          {
            key: "activity",
            label: "Activity",
            options: [
              opt("1", "Bedfast", "Confined to bed."),
              opt("2", "Chairfast", "Walking severely limited or none; needs help into chair/wheelchair."),
              opt("3", "Walks Occasionally", "Walks short distances during day; most of shift in bed or chair."),
              opt("4", "Walks Frequently", "Walks outside room at least twice a day and inside every two hours."),
            ],
          },
          {
            key: "mobility",
            label: "Mobility",
            options: [
              opt("1", "Completely Immobile", "Makes no changes in body or extremity position without help."),
              opt("2", "Very Limited", "Occasional slight changes; cannot make frequent or significant changes alone."),
              opt("3", "Slightly Limited", "Frequent slight changes in position independently."),
              opt("4", "No Limitation", "Major and frequent position changes without help."),
            ],
          },
          {
            key: "nutrition",
            label: "Nutrition (usual food intake)",
            options: [
              opt("1", "Very Poor", "Rarely eats more than 1/3 of a meal, or NPO / clear liquids / IV for more than 5 days."),
              opt("2", "Probably Inadequate", "Rarely eats a complete meal, about 1/2 of food, or less than optimum tube feeding."),
              opt("3", "Adequate", "Eats over half of most meals, or tube feeding / TPN meets most needs."),
              opt("4", "Excellent", "Eats most of every meal; never refuses a meal."),
            ],
          },
          {
            key: "friction_shear",
            label: "Friction & Shear",
            options: [
              opt("1", "Problem", "Needs moderate to maximum help moving; frequently slides down in bed or chair."),
              opt("2", "Potential Problem", "Moves feebly or needs minimum help; occasionally slides down."),
              opt("3", "No Apparent Problem", "Moves in bed and chair independently; keeps good position."),
            ],
          },
        ],
      },
      {
        type: "total",
        compute: (values) => sumScores(values, BRADEN_KEYS),
        incompleteText: "Score all 6 rows to see the total.",
        level: (total) => {
          if (total <= 12) return { text: "High risk", tone: "red", note: "Score 16 or less: implement Pressure Ulcer Prevention Protocols." };
          if (total <= 14) return { text: "Moderate risk", tone: "amber", note: "Score 16 or less: implement Pressure Ulcer Prevention Protocols." };
          if (total <= 16) return { text: "Low risk", tone: "amber", note: "Score 16 or less: implement Pressure Ulcer Prevention Protocols." };
          return { text: "Not at risk", tone: "green" };
        },
      },
      {
        type: "checks",
        title: "Pressure reduction devices used",
        items: [
          check("device_state_air", "State Air"),
          check("device_alternating_pressure", "Alternating Pressure"),
          check("device_low_air_loss", "Low Air Loss Mattress"),
          check("device_other", "Other", [{ key: "device_other_detail", placeholder: "Specify" }]),
        ],
      },
      {
        type: "inputs",
        items: [input("device_date", "Device date", { date: true }), input("device_initials", "Initials")],
      },
      {
        type: "inputs",
        title: "Nutritional consult ordered",
        items: [
          input("consult_date_1", "Date", { date: true }),
          input("consult_initials_1", "Initials"),
          input("consult_date_2", "Date", { date: true }),
          input("consult_initials_2", "Initials"),
        ],
      },
    ],
  },
  {
    id: "supplies",
    label: "Supplies",
    blocks: [
      supplyGroup("gu", "GU", [
        "Acetic Acid 1/4% Irrigation",
        "Urethral Catheter",
        "Cath Plug/Clamp",
        "Foley Cath Tray",
        "Irrigation Set",
        "Leg Bag",
        "Normal Saline Irrigation",
        "Syringe 2oz Irrigation Tip",
      ]),
      supplyGroup("dressing", "Dressing", [
        "ABD Pads",
        "Ace Bandage",
        "Adaptic",
        "Betadine Solution",
        "Duoderm",
        "Kerlix Sponges",
        "H2O2",
        "Iodoform Nugauze",
        "Kerlix",
        "Kling",
        "Plain Packing Strips",
        "Cotton Tipped Applicators",
        "Tape",
        "Transparent Dressing",
        "2 x 2 Gauze",
        "4 x 4 Gauze",
        "Syringes",
        "Calcium Alginate",
        "Hydrogel",
        "Suture Removal Kit",
        "Skin Prep",
        "Telfa",
      ]),
      supplyGroup("iv", "IV", [
        "Alcohol Wipes",
        "Betadine Wipes",
        "IV Catheter Plug",
        "IV Pump",
        "IV Start Kit",
        "Needles",
        "Syringes",
        "Tape",
        "IV Tubing",
        "PICC Line",
        "IV Cannulas",
      ]),
      supplyGroup("trach", "Trach", ["Trach Cleaning Kits", "Suction Catheters", "Sterile H2O", "Suction Machine"]),
      supplyGroup("gi", "GI", [
        "Castile Soap",
        "Ostomy Wafers and Pouches",
        "Enema Kit",
        "Feeding Pump",
        "Feeding Bag/Tubing",
        "Fleets Enema",
        "NG Tube",
        "Peg Tube",
        "Tape",
      ]),
      supplyGroup("gloves", "Gloves", ["Non-Sterile Gloves", "Sterile Gloves"]),
      supplyGroup("dme", "Durable Medical Equipment", [
        "Brace",
        "Bedside Commode",
        "Cane",
        "Linen Savers",
        "Eggcrate Mattress",
        "Hospital Bed",
        "Pulmoaide",
        "Raised Toilet Seat",
        "Trapeze",
        "Walker",
        "Wheelchair",
        "3-in-1",
        "Gait Belt",
        "Theraband",
        "Shower Bench/Chair",
        "Pressure Relief Mattress",
        "Hoyer Lift",
        "O2 and Supplies",
      ]),
      supplyGroup("misc", "Miscellaneous", ["ABG Kits", "Specimen Container", "Stockings", "Venipuncture Kit"]),
      { type: "notes", key: "diabetic_supplies", label: "Diabetic supplies" },
    ],
  },
  {
    id: "endocrine",
    label: "Endocrine / Immune",
    blocks: [
      { type: "inputs", items: [input("onset", "Onset"), input("blood_sugar", "Blood sugar", { numeric: true })] },
      {
        type: "checks",
        title: "History",
        items: [
          check("diabetes_mellitus", "Diabetes Mellitus"),
          check("insulin_dependent", "ID (insulin dependent)", [{ key: "insulin_dependent_detail", placeholder: "Details" }]),
          check("non_insulin_dependent", "NID (non-insulin dependent)", [
            { key: "non_insulin_dependent_detail", placeholder: "Details" },
          ]),
          check("immunosuppression", "Immunosuppression"),
          check("hyperthyroidism", "Hyperthyroidism"),
          check("hypothyroidism", "Hypothyroidism"),
        ],
      },
      {
        type: "choices",
        title: "Signs / symptoms",
        rows: [
          choiceRow("bgt", "BGT (blood glucose testing)", YES_NO, { key: "bgt_frequency", placeholder: "Frequency" }),
          choiceRow("bgt_independent", "Independent with BGT", YES_NO_NA),
          choiceRow("easily_bruised_bleeding", "Easily bruised/bleeding", YES_NO),
          choiceRow("fevers", "Fevers", YES_NO),
          choiceRow("flushings", "Flushings", YES_NO),
          choiceRow("night_sweats", "Night sweats", YES_NO),
        ],
      },
      {
        type: "choices",
        title: "Diabetic teaching",
        rows: [
          choiceRow("understands_diabetic_regimen", "Reports understanding/compliance with diabetic regimen", YES_NO_NA),
          choiceRow("demonstrates_glucose_testing", "Demonstrates blood glucose testing correctly", YES_NO_NA),
          choiceRow("demonstrates_insulin_injection", "Demonstrates insulin injection correctly", YES_NO_NA),
          choiceRow("demonstrates_syringe_preparation", "Demonstrates preparation of insulin syringes correctly", YES_NO_NA),
        ],
      },
    ],
  },
  {
    id: "disposition",
    label: "Disposition of Evaluation",
    blocks: [
      {
        type: "checks",
        wide: true,
        items: [
          check("open_case", "Open case to service, completed forms/interventions below"),
          check("left_copy", "Patient/caregiver I/S on, signed, and was left a copy of:"),
          check(
            "consent_form",
            "Consent Form — confidentiality of records; OASIS data collection and secured electronic submission to State/Federal agencies; payment for services by Medicare; release of medical records"
          ),
          check(
            "patient_rights",
            "Patient's Rights & Responsibilities — including HH Agency complaint/grievance procedure and State Hotline phone number"
          ),
          check("advance_directives", "I/S, written information given to patient/caregiver about Advance Directives"),
          check("oasis_privacy", "OASIS Patient Privacy Statement given to patient/caregiver"),
          check("verbalized_understanding", "Patient/caregiver verbalized understanding of all I/S's"),
        ],
      },
      {
        type: "choices",
        title: "Patient / caregiver",
        rows: [
          choiceRow("participated_poc", "Participated in development of plan of care", YES_NO),
          choiceRow("understands_discharge_goals", "Informed of and understands discharge goals and projected D/C date", YES_NO, {
            key: "projected_dc_date",
            placeholder: "Projected D/C date",
            date: true,
          }),
          choiceRow("expectations_consistent", "Expectations are consistent with the plan of care", YES_NO),
        ],
      },
      {
        type: "checks",
        title: "Evaluation only visit",
        wide: true,
        items: [
          check("evaluation_only", "Evaluation only visit as:"),
          check("not_homebound", "Patient not homebound"),
          check("no_skilled_need", "No skilled RN/LVN is medically necessary"),
          check("refuses_care", "Patient/caregiver refuses care and/or to give consent"),
        ],
      },
    ],
  },
  {
    id: "summary",
    label: "Summary of Care & Past History",
    blocks: [
      { type: "notes", key: "skilled_care_summary", label: "Summary of skilled care and teaching provided", lines: 6 },
      { type: "notes", key: "past_medical_history", label: "Past medical history / pertinent information", lines: 6 },
    ],
  },
  {
    id: "fall_risk",
    label: "Fall Risk Assessment",
    hint: "Suggested scores come from your CMS answers. Check them and change if needed.",
    blocks: [
      {
        type: "score",
        rows: [
          {
            key: "consciousness",
            label: "A. Level of Consciousness / Mental Status",
            options: [opt("0", "Alert and oriented x3"), opt("2", "Disoriented x3 at all times"), opt("4", "Intermittent confusion")],
            suggest: {
              source: "M1700",
              fields: ["M1700_COG_FUNCTION"],
              compute: ([m1700]) => {
                const code = cmsCode(m1700);
                if (code === null) return null;
                if (code === 0) return "0";
                return code === 4 ? "2" : "4";
              },
            },
          },
          {
            key: "falls_history",
            label: "B. History of Falls (past 3 months)",
            options: [opt("0", "No falls"), opt("2", "1–2 falls"), opt("4", "3 or more falls")],
          },
          {
            key: "ambulation",
            label: "C. Ambulation / Elimination Status",
            options: [
              opt("0", "Ambulatory and continent"),
              opt("2", "Chair bound and requires assist with toileting"),
              opt("4", "Ambulatory and incontinent"),
            ],
            suggest: {
              source: "M1860 + M1610/M1620",
              fields: ["M1860_CRNT_AMBLTN", "M1610_UR_INCONT", "M1620_BWL_INCONT"],
              compute: ([m1860, m1610, m1620]) => {
                const walk = cmsCode(m1860);
                const urine = cmsCode(m1610);
                if (walk === null || urine === null) return null;
                if (walk >= 4) return "2";
                const bowel = cmsCode(m1620);
                const incontinent = urine === 1 || (bowel !== null && bowel >= 1);
                return incontinent ? "4" : "0";
              },
            },
          },
          {
            key: "vision",
            label: "D. Vision Status",
            options: [opt("0", "Adequate (with or without glasses)"), opt("2", "Poor (with or without glasses)"), opt("4", "Legally blind")],
            suggest: {
              source: "B1000",
              fields: ["B1000"],
              compute: ([b1000]) => {
                const code = cmsCode(b1000);
                if (code === null) return null;
                if (code === 0) return "0";
                return code <= 2 ? "2" : "4";
              },
            },
          },
        ],
      },
      {
        type: "checks",
        title: "E. Gait and Balance (stand without assist, walk forward, through a doorway, then turn)",
        items: [
          check("gait_normal", "Normal/safe gait and balance (0)"),
          check("gait_balance_standing", "Balance problem while standing (+1)"),
          check("gait_balance_walking", "Balance problem while walking (+1)"),
          check("gait_coordination", "Decreased muscular coordination (+1)"),
          check("gait_doorway", "Change in gait pattern through doorway (+1)"),
          check("gait_turns", "Jerking or unstable when making turns (+1)"),
          check("gait_assistance", "Requires assistance — person, furniture/walls or device (+1)"),
        ],
      },
      {
        type: "score",
        rows: [
          {
            key: "orthostatic",
            label: "F. Orthostatic Changes",
            options: [
              opt("0", "No drop in BP lying to standing; no change in heart rhythm"),
              opt("2", "Drop < 20 mmHg; heart rate increase < 20"),
              opt("4", "Drop > 20 mmHg; heart rate increase > 20"),
            ],
          },
          {
            key: "medications",
            label:
              "G. Medications (anesthetics, antihistamines, cathartics, diuretics, antihypertensives, antiseizure, benzodiazepines, hypoglycemics, psychotropics, sedatives/hypnotics)",
            options: [
              opt("0", "None taken currently or in past 7 days"),
              opt("2", "Takes 1–2 of these currently or in past 7 days"),
              opt("4", "Takes 3–4 of these currently or in past 7 days"),
            ],
          },
        ],
      },
      {
        type: "checks",
        items: [check("medication_change", "Change in these medications or doses in past 5 days (+1)")],
      },
      {
        type: "score",
        rows: [
          {
            key: "diseases",
            label:
              "H. Predisposing Diseases (hypertension, vertigo, CVA, Parkinson's, loss of limb(s), seizures, arthritis, osteoporosis, fractures)",
            options: [opt("0", "None present"), opt("2", "1–2 present"), opt("4", "3 or more present")],
          },
        ],
      },
      {
        type: "checks",
        title: "I. Equipment Issues",
        items: [
          check("equipment_none", "No risk factors noted (0)"),
          check("equipment_oxygen", "Oxygen tubing (+1)"),
          check("equipment_device_use", "Inappropriate or inconsistent use of assistive device (+1)"),
          check("equipment_needs", "Equipment needs (+1)"),
          check("equipment_other", "Other (+1)", [{ key: "equipment_other_detail", placeholder: "Specify" }]),
        ],
      },
      {
        type: "total",
        compute: fallRiskTotal,
        incompleteText: "Answer A, B, C, D, F, G and H to see the total.",
        level: (total) =>
          total >= 10
            ? { text: "High risk for falls", tone: "red", note: "Score 10 or more: complete the referral section below." }
            : { text: "Not high risk", tone: "green" },
      },
      {
        type: "choice",
        key: "patient_informed",
        label: "Patient informed of fall risk results and prevention recommendations",
        options: [...YES_NO, ["see_visit_documentation", "See visit documentation"]],
      },
      { type: "notes", key: "informed_comments", label: "Comments" },
      {
        type: "image",
        title: "Fall Risk Assessment Algorithm",
        src: fallRiskAlgorithm,
        alt: "Fall risk algorithm: score 10 or more leads to referrals to PT, MSW, OT, SN and Aide",
        showWhen: isHighFallRisk,
      },
      {
        type: "checks",
        title: "Additional services requested",
        showWhen: isHighFallRisk,
        items: [
          check("service_sn", "SN"),
          check("service_pt", "PT"),
          check("service_ot", "OT"),
          check("service_msw", "MSW"),
          check("service_aide", "Aide"),
          check("service_other", "Other", [{ key: "service_other_detail", placeholder: "Specify" }]),
        ],
      },
      {
        type: "checks",
        title: "If no additional services requested, reason",
        showWhen: isHighFallRisk,
        items: [
          check("no_service_already_ordered", "Discipline already ordered"),
          check("no_service_assessed_30_days", "Patient assessed by this discipline within last 30 days"),
          check("no_service_refused", "Patient refused additional discipline"),
        ],
      },
      { type: "notes", key: "referral_comments", label: "Referral comments", showWhen: isHighFallRisk },
    ],
  },
  {
    id: "signature",
    label: "Staff Signature",
    hint: "Sign once for the whole SOC assessment. Date and time fill in when you sign.",
    blocks: [{ type: "signature" }],
  },
];

function blankYesNoRow(row) {
  return {
    answer: "",
    date: "",
    ...(row.specify ? { specify: "" } : {}),
    ...(row.sides ? { left: false, right: false } : {}),
  };
}

function blockLeaves(block) {
  if (block.type === "checks") {
    return block.items.flatMap((item) => [
      { key: item.key, blank: false, counts: true },
      ...(item.details ?? []).map((detail) => ({ key: detail.key, blank: "" })),
    ]);
  }
  if (block.type === "inputs") return block.items.map((item) => ({ key: item.key, blank: "", counts: true }));
  if (block.type === "notes" || block.type === "choice") return [{ key: block.key, blank: "", counts: true }];
  if (block.type === "score") return block.rows.map((scoreRow) => ({ key: scoreRow.key, blank: "", counts: true }));
  if (block.type === "choices") {
    return block.rows.flatMap((choice) => [
      { key: choice.key, blank: "", counts: true },
      ...(choice.detail ? [{ key: choice.detail.key, blank: "" }] : []),
    ]);
  }
  if (block.type === "total")
    return [
      { key: "total", blank: "" },
      { key: "risk_level", blank: "" },
    ];
  if (block.type === "signature") {
    return [
      { key: "image", blank: "", counts: true },
      { key: "title", blank: "" },
      { key: "date", blank: "" },
      { key: "time", blank: "" },
    ];
  }
  return [];
}

function sectionValues(section, saved) {
  const values = {};
  for (const block of section.blocks) {
    if (block.type === "yesNo") {
      for (const row of block.rows) values[row.key] = { ...blankYesNoRow(row), ...saved?.[row.key] };
    } else {
      for (const leaf of blockLeaves(block)) values[leaf.key] = saved?.[leaf.key] ?? leaf.blank;
    }
  }
  return values;
}

export function agencyValues(saved) {
  return Object.fromEntries(AGENCY_SECTIONS.map((section) => [section.id, sectionValues(section, saved?.[section.id])]));
}

export function agencyProgress(values) {
  const filled = AGENCY_SECTIONS.flatMap((section) =>
    section.blocks.flatMap((block) =>
      block.type === "yesNo"
        ? block.rows.map((row) => values?.[section.id]?.[row.key]?.answer)
        : blockLeaves(block)
            .filter((leaf) => leaf.counts)
            .map((leaf) => values?.[section.id]?.[leaf.key])
    )
  );
  return filled.filter(Boolean).length / filled.length;
}

export const agencySection = {
  id: "agency",
  label: "Agency (non-CMS)",
  agency: true,
  items: [],
  progress: (answers) => agencyProgress(answers?.[AGENCY_KEY]),
};
