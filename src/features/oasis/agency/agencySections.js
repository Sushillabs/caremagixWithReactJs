export const AGENCY_KEY = "agency_assessment";

const row = (key, label, extra = {}) => ({ key, label, ...extra });

export const AGENCY_SECTIONS = [
  {
    id: "neuro",
    label: "Neuro Function",
    groups: [
      {
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
];

const sectionRows = (section) => section.groups.flatMap((group) => group.rows);

function blankRow(row) {
  return {
    answer: "",
    date: "",
    ...(row.specify ? { specify: "" } : {}),
    ...(row.sides ? { left: false, right: false } : {}),
  };
}

export function agencyValues(saved) {
  return Object.fromEntries(
    AGENCY_SECTIONS.map((section) => [
      section.id,
      Object.fromEntries(
        sectionRows(section).map((row) => [row.key, { ...blankRow(row), ...saved?.[section.id]?.[row.key] }])
      ),
    ])
  );
}

export function agencyProgress(values) {
  const answers = AGENCY_SECTIONS.flatMap((section) =>
    sectionRows(section).map((row) => values?.[section.id]?.[row.key]?.answer)
  );
  return answers.filter(Boolean).length / answers.length;
}

export const agencySection = {
  id: "agency",
  label: "Agency (non-CMS)",
  agency: true,
  items: [],
  progress: (answers) => agencyProgress(answers?.[AGENCY_KEY]),
};
