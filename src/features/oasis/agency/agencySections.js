import painBodyMap from "./images/pain-body-map.png";
import skinBodyMap from "./images/skin-body-map.png";

export const AGENCY_KEY = "agency_assessment";

const row = (key, label, extra = {}) => ({ key, label, ...extra });
const check = (key, label, details) => ({ key, label, ...(details ? { details } : {}) });
const input = (key, label, extra = {}) => ({ key, label, ...extra });

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
        items: [
          input("height", "Height", { placeholder: "e.g. 5 ft 6 in" }),
          input("weight_lbs", "Weight (lbs)", { numeric: true }),
        ],
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
        caption: "Marking on the picture is not available yet. Write the location in the fields below.",
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
      { type: "choice", key: "skin_turgor", label: "Skin Turgor", options: ["Good", "Fair", "Poor"] },
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
        caption: "Marking on the picture is not available yet. Write size and location in the table below.",
      },
      {
        type: "inputs",
        title: "Type / Size",
        items: [
          input("lesion_size", "1. Lesion", { placeholder: "Size, location" }),
          input("bruises_size", "2. Bruises", { placeholder: "Size, location" }),
          input("scars_size", "3. Scars", { placeholder: "Size, location" }),
          input("pressure_sore_size", "4a. Wound — Pressure sore(s)", { placeholder: "Size, location" }),
          input("stasis_ulcer_size", "4b. Wound — Stasis ulcer(s)", { placeholder: "Size, location" }),
          input("surgical_incision_size", "4c. Wound — Surgical incision(s)", { placeholder: "Size, location" }),
          input("other_type", "5. Other (specify)"),
          input("other_size", "5. Other — size", { placeholder: "Size, location" }),
        ],
      },
    ],
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
