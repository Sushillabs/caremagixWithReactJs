import { FIELD_WIDGETS as W } from "../../../engine/schema";
import { coded, checks, numeric, notice } from "./helpers";

export const b0200 = (fieldId) =>
  coded(
    "B0200",
    fieldId,
    "Hearing",
    [
      ["0", "Adequate – no difficulty in normal conversation, social interaction, listening to TV"],
      ["1", "Minimal difficulty – difficulty in some environments (e.g., when person speaks softly, or setting is noisy)"],
      ["2", "Moderate difficulty – speaker has to increase volume and speak distinctly"],
      ["3", "Highly impaired – absence of useful hearing"],
    ],
    { description: "Ability to hear (with hearing aid or hearing appliances if normally used)." }
  );

export const b1000 = (fieldId) =>
  coded(
    "B1000",
    fieldId,
    "Vision",
    [
      ["0", "Adequate – sees fine detail, such as regular print in newspapers/books"],
      ["1", "Impaired – sees large print, but not regular print in newspapers/books"],
      ["2", "Moderately impaired – limited vision; not able to see newspaper headlines but can identify objects"],
      ["3", "Highly impaired – object identification in question, but eyes appear to follow objects"],
      ["4", "Severely impaired – no vision or sees only light, colors, or shapes; eyes do not appear to follow objects"],
    ],
    { description: "Ability to see in adequate light (with glasses or other visual appliances)." }
  );

const FREQUENCY_0_TO_4_DECLINE = [
  ["0", "Never"],
  ["1", "Rarely"],
  ["2", "Sometimes"],
  ["3", "Often"],
  ["4", "Always"],
  ["7", "Patient declines to respond"],
  ["8", "Patient unable to respond"],
];

export const b1300 = (fieldId) =>
  coded("B1300", fieldId, "Health Literacy (From Creative Commons ©)", FREQUENCY_0_TO_4_DECLINE, {
    description:
      "How often do you need to have someone help you when you read instructions, pamphlets, or other written material from your doctor or pharmacy?",
  });

export const c0100 = (fieldId) =>
  coded(
    "C0100",
    fieldId,
    "Should Brief Interview for Mental Status (C0200–C0500) be Conducted?",
    [
      ["0", "No (patient is rarely/never understood) → Skip to C1310"],
      ["1", "Yes → Continue to C0200"],
    ],
    { description: "Attempt to conduct interview with all patients." }
  );

export const bimsHeading = () => notice("BIMS-HEADING", "Brief Interview for Mental Status (BIMS)");

export const c0200 = (fieldId) =>
  coded(
    "C0200",
    fieldId,
    "Repetition of Three Words",
    [
      ["0", "None"],
      ["1", "One"],
      ["2", "Two"],
      ["3", "Three"],
    ],
    {
      description:
        'Ask patient: "I am going to say three words for you to remember. Please repeat the words after I have said all three. The words are: sock, blue, and bed. Now tell me the three words." Number of words repeated after first attempt:',
    }
  );

export const c0300a = (fieldId) =>
  coded("C0300A", fieldId, "Temporal Orientation — Able to report correct year", [
    ["0", "Missed by >5 years or no answer"],
    ["1", "Missed by 2-5 years"],
    ["2", "Missed by 1 year"],
    ["3", "Correct"],
  ]);

export const c0300b = (fieldId) =>
  coded("C0300B", fieldId, "Temporal Orientation — Able to report correct month", [
    ["0", "Missed by >1 month or no answer"],
    ["1", "Missed by 6 days to 1 month"],
    ["2", "Accurate within 5 days"],
  ]);

export const c0300c = (fieldId) =>
  coded("C0300C", fieldId, "Temporal Orientation — Able to report correct day of the week", [
    ["0", "Incorrect or no answer"],
    ["1", "Correct"],
  ]);

const recall = (itemCode, fieldId, word, cue, extra) =>
  coded(
    itemCode,
    fieldId,
    `Recall — Able to recall "${word}"`,
    [
      ["0", "No — could not recall"],
      ["1", `Yes, after cueing ("${cue}")`],
      ["2", "Yes, no cue required"],
    ],
    extra
  );

export const c0400a = (fieldId) =>
  recall("C0400A", fieldId, "sock", "something to wear", {
    description:
      'Ask patient: "Let\'s go back to an earlier question. What were those three words that I asked you to repeat?" If unable to remember a word, give cue for that word.',
  });
export const c0400b = (fieldId) => recall("C0400B", fieldId, "blue", "a color");
export const c0400c = (fieldId) => recall("C0400C", fieldId, "bed", "a piece of furniture");

export const c0500 = (fieldId) =>
  numeric("C0500", fieldId, "BIMS Summary Score", { min: 0, max: 99 }, {
    description:
      "Add scores for questions C0200–C0400 and fill in total score (00–15). Enter 99 if the patient was unable to complete the interview.",
    placeholder: "00",
  });

export const deliriumHeading = () =>
  notice("CAM-HEADING", "Signs and Symptoms of Delirium (CAM©)", [
    "C1310 coding: 0=Behavior not present; 1=Behavior continuously present, does not fluctuate; 2=Behavior present, fluctuates",
  ]);

export const c1310a = (fieldId) =>
  coded(
    "C1310A",
    fieldId,
    "Acute Onset of Mental Status Change",
    [
      ["0", "No"],
      ["1", "Yes"],
    ],
    { description: "Is there evidence of an acute change in mental status from the patient's baseline?" }
  );
export const c1310b = (fieldId) => coded("C1310B", fieldId, "Inattention", []);
export const c1310c = (fieldId) => coded("C1310C", fieldId, "Disorganized Thinking", []);
export const c1310d = (fieldId) => coded("C1310D", fieldId, "Altered Level of Consciousness", []);

export const m1700 = (fieldId) =>
  coded(
    "M1700",
    fieldId,
    "Cognitive Functioning",
    [
      ["0", "Alert/oriented, able to focus and shift attention, comprehends and recalls task directions independently."],
      ["1", "Requires prompting (cueing, repetition, reminders) only under stressful or unfamiliar conditions."],
      ["2", "Requires assistance and some direction in specific situations or consistently requires low stimulus environment."],
      ["3", "Requires considerable assistance in routine situations. Not alert and oriented or unable to shift attention more than half the time."],
      ["4", "Totally dependent due to disturbances such as constant disorientation, coma, persistent vegetative state, or delirium."],
    ],
    {
      description:
        "Patient's current (day of assessment) level of alertness, orientation, comprehension, concentration, and immediate memory for simple commands.",
    }
  );

export const m1710 = (fieldId) =>
  coded(
    "M1710",
    fieldId,
    "When Confused (Reported or Observed Within the Last 14 Days)",
    [
      ["0", "Never"],
      ["1", "In new or complex situations only"],
      ["2", "On awakening or at night only"],
      ["3", "During the day and evening, but not constantly"],
      ["4", "Constantly"],
      ["NA", "Patient nonresponsive"],
    ],
    { maxLength: 2 }
  );

export const m1720 = (fieldId) =>
  coded(
    "M1720",
    fieldId,
    "When Anxious (Reported or Observed Within the Last 14 Days)",
    [
      ["0", "None of the time"],
      ["1", "Less than often daily"],
      ["2", "Daily, but not constantly"],
      ["3", "All of the time"],
      ["NA", "Patient nonresponsive"],
    ],
    { maxLength: 2 }
  );

const PHQ_SYMPTOMS = [
  ["A", "Little interest or pleasure in doing things"],
  ["B", "Feeling down, depressed, or hopeless"],
  ["C", "Trouble falling or staying asleep, or sleeping too much"],
  ["D", "Feeling tired or having little energy"],
  ["E", "Poor appetite or overeating"],
  ["F", "Feeling bad about yourself — or that you are a failure or have let yourself or your family down"],
  ["G", "Trouble concentrating on things, such as reading the newspaper or watching television"],
  ["H", "Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual"],
  ["I", "Thoughts that you would be better off dead, or of hurting yourself in some way"],
];

export const d0150 = (keyFor) => ({
  itemCode: "D0150",
  label: "Patient Mood Interview (PHQ-2 to 9)",
  description:
    "Over the last 2 weeks, have you been bothered by any of the following problems? Column 1 = Symptom Presence (0=No, 1=Yes, 9=No response); Column 2 = Symptom Frequency (0=Never or 1 day, 1=2-6 days, 2=7-11 days, 3=12-14 days).",
  widget: W.CODE_TABLE,
  rowHeader: "Symptom",
  columns: [
    { label: "1. Presence", hint: "0=No, 1=Yes, 9=No resp.", maxLength: 1 },
    { label: "2. Frequency", hint: "0–3 or blank", maxLength: 1 },
  ],
  tableRows: PHQ_SYMPTOMS.map(([letter, label]) => ({
    label: `${letter}. ${label}`,
    fieldIds: [keyFor(letter, 1), keyFor(letter, 2)],
  })),
});

export const d0160 = (fieldId) =>
  numeric("D0160", fieldId, "Total Severity Score", { min: 0, max: 99 }, {
    description:
      "Add scores for all frequency responses in Column 2. Total score must be between 00 and 27. Enter 99 if unable to complete interview.",
    placeholder: "00",
  });

export const d0700 = (fieldId) =>
  coded("D0700", fieldId, "Social Isolation", FREQUENCY_0_TO_4_DECLINE, {
    description: "How often do you feel lonely or isolated from those around you?",
  });

export const m1740 = (keys) =>
  checks(
    "M1740",
    "Cognitive, Behavioral, and Psychiatric Symptoms that are demonstrated at least once a week (Reported or Observed)",
    keys,
    [
      "1. Memory deficit: failure to recognize familiar persons/places, inability to recall events of past 24 hours, significant memory loss so that supervision is required",
      "2. Impaired decision-making: failure to perform usual ADLs or IADLs, inability to appropriately stop activities, jeopardizes safety through actions",
      "3. Verbal disruption: yelling, threatening, excessive profanity, sexual references, etc.",
      "4. Physical aggression: aggressive or combative to self and others (for example, hits self, throws objects, punches, dangerous maneuvers with wheelchair or other objects)",
      "5. Disruptive, infantile, or socially inappropriate behavior (excludes verbal actions)",
      "6. Delusional, hallucinatory, or paranoid behavior",
      "7. None of the above behaviors demonstrated",
    ],
    { description: "Check all that apply." }
  );

export const m1745 = (fieldId) =>
  coded(
    "M1745",
    fieldId,
    "Frequency of Disruptive Behavior Symptoms (Reported or Observed)",
    [
      ["0", "Never"],
      ["1", "Less than once a month"],
      ["2", "Once a month"],
      ["3", "Several times each month"],
      ["4", "Several times a week"],
      ["5", "At least daily"],
    ],
    {
      description:
        "Any physical, verbal, or other disruptive/dangerous symptoms that are injurious to self or others or jeopardize personal safety.",
    }
  );
