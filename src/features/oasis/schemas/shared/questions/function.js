import { FIELD_WIDGETS as W } from "../../../engine/schema";
import { coded, checks, notice } from "./helpers";

const LIVING_ROWS = [
  "A. Patient lives alone",
  "B. Patient lives with other person(s) in the home",
  "C. Patient lives in congregate situation (e.g., assisted living, residential care home)",
];
const LIVING_COLS = [
  "Around the Clock",
  "Regular Daytime",
  "Regular Night-time",
  "Occasional/ Short-Term",
  "No Assistance Available",
];

export const m1100 = (fieldId) => ({
  itemCode: "M1100",
  fieldId,
  label: "Patient Living Situation",
  description:
    "Which of the following best describes the patient's residential circumstance and availability of assistance? Check one box only.",
  widget: W.LIVING_GRID,
  maxLength: 2,
  options: LIVING_ROWS.flatMap((rowGroup, r) =>
    LIVING_COLS.map((colGroup, c) => ({
      value: String(r * LIVING_COLS.length + c + 1).padStart(2, "0"),
      label: `${rowGroup} — ${colGroup}`,
      rowGroup,
      colGroup,
    }))
  ),
});

export const m2102f = (fieldId) =>
  coded(
    "M2102f",
    fieldId,
    "Types and Sources of Assistance — f. Supervision and safety (due to cognitive impairment)",
    [
      ["0", "No assistance needed — patient is independent or does not have needs in this area"],
      ["1", "Non-agency caregiver(s) currently provide assistance"],
      ["2", "Non-agency caregiver(s) need training/supportive services to provide assistance"],
      ["3", "Non-agency caregiver(s) are not likely to provide assistance OR it is unclear if they will provide assistance"],
      ["4", "Assistance needed, but no non-agency caregiver(s) available"],
    ],
    {
      description:
        "Codes: 0=No assistance needed, 1=Non-agency caregiver(s) currently provide assistance, 2=Caregiver(s) need training/supportive services, 3=Caregiver(s) not likely to provide or unclear, 4=Assistance needed but no caregiver available",
    }
  );

const G_ITEMS = {
  M1800: [
    "Grooming",
    "Current ability to tend safely to personal hygiene needs (washing face and hands, hair care, shaving or make up, teeth or denture care, or fingernail care).",
    [
      "Able to groom self unaided, with or without the use of assistive devices or adapted methods.",
      "Grooming utensils must be placed within reach before able to complete grooming activities.",
      "Someone must assist the patient to groom self.",
      "Patient depends entirely upon someone else for grooming needs.",
    ],
  ],
  M1810: [
    "Current Ability to Dress Upper Body safely",
    "with or without dressing aids, including undergarments, pullovers, front-opening shirts and blouses, managing zippers, buttons, and snaps.",
    [
      "Able to get clothes out of closets and drawers, put them on and remove them from the upper body without assistance.",
      "Able to dress upper body without assistance if clothing is laid out or handed to the patient.",
      "Someone must help the patient put on upper body clothing.",
      "Patient depends entirely upon another person to dress the upper body.",
    ],
  ],
  M1820: [
    "Current Ability to Dress Lower Body safely",
    "with or without dressing aids, including undergarments, slacks, socks or nylons, shoes.",
    [
      "Able to obtain, put on, and remove clothing and shoes without assistance.",
      "Able to dress lower body without assistance if clothing and shoes are laid out or handed to the patient.",
      "Someone must help the patient put on undergarments, slacks, socks or nylons, and shoes.",
      "Patient depends entirely upon another person to dress lower body.",
    ],
  ],
  M1830: [
    "Bathing",
    "Current ability to wash entire body safely. Excludes grooming.",
    [
      "Able to bathe self in shower or tub independently, including getting in and out of tub/shower.",
      "With the use of devices, is able to bathe self in shower or tub independently.",
      "Able to bathe in shower or tub with the intermittent assistance of another person.",
      "Able to participate in bathing self in shower or tub, but requires presence of another person throughout.",
      "Unable to use the shower or tub, but able to bathe self independently at the sink, in chair, or on commode.",
      "Unable to use the shower or tub, but able to participate in bathing self in bed, at the sink, in bedside chair, or on commode, with assistance or supervision.",
      "Unable to participate effectively in bathing and is bathed totally by another person.",
    ],
  ],
  M1840: [
    "Toilet Transferring",
    "Current ability to get to and from the toilet or bedside commode safely and transfer on and off toilet/commode.",
    [
      "Able to get to and from the toilet and transfer independently with or without a device.",
      "When reminded, assisted, or supervised by another person, able to get to and from the toilet and transfer.",
      "Unable to get to and from the toilet but is able to use a bedside commode (with or without assistance).",
      "Unable to get to and from the toilet or bedside commode but is able to use a bedpan/urinal independently.",
      "Is totally dependent in toileting.",
    ],
  ],
  M1845: [
    "Toileting Hygiene",
    "Current ability to maintain perineal hygiene safely, adjust clothes and/or incontinence pads before and after using toilet, commode, bedpan, urinal.",
    [
      "Able to manage toileting hygiene and clothing management without assistance.",
      "Able to manage toileting hygiene and clothing management without assistance if supplies/implements are laid out.",
      "Someone must help the patient to maintain toileting hygiene and/or adjust clothing.",
      "Patient depends entirely upon another person to maintain toileting hygiene.",
    ],
  ],
  M1850: [
    "Transferring",
    "Current ability to move safely from bed to chair, or ability to turn and position self in bed if patient is bedfast.",
    [
      "Able to independently transfer.",
      "Able to transfer with minimal human assistance or with use of an assistive device.",
      "Able to bear weight and pivot during the transfer process but unable to transfer self.",
      "Unable to transfer self and is unable to bear weight or pivot when transferred by another person.",
      "Bedfast, unable to transfer but is able to turn and position self in bed.",
      "Bedfast, unable to transfer and is unable to turn and position self.",
    ],
  ],
  M1860: [
    "Ambulation/Locomotion",
    "Current ability to walk safely, once in a standing position, or use a wheelchair, once in a seated position, on a variety of surfaces.",
    [
      "Able to independently walk on even and uneven surfaces and negotiate stairs with or without railings.",
      "With the use of a one-handed device, able to independently walk on even and uneven surfaces and negotiate stairs.",
      "Requires use of a two-handed device to walk alone on a level surface and/or requires human supervision to negotiate stairs.",
      "Able to walk only with the supervision or assistance of another person at all times.",
      "Chairfast, unable to ambulate but is able to wheel self independently.",
      "Chairfast, unable to ambulate and is unable to wheel self.",
      "Bedfast, unable to ambulate or be up in a chair.",
    ],
  ],
};

// keyFor maps the CMS item code ("M1800") to this form's field key.
export const gFunctionalItems = (keyFor) =>
  Object.entries(G_ITEMS).map(([itemCode, [label, description, options]]) =>
    coded(
      itemCode,
      keyFor(itemCode),
      label,
      options.map((text, i) => [String(i), text]),
      { description, maxLength: 2 }
    )
  );

export const gg0100 = (keyFor) => ({
  itemCode: "GG0100",
  label: "Prior Functioning: Everyday Activities",
  description:
    "Indicate the patient's usual ability with everyday activities prior to the current illness, exacerbation, or injury. Coding: 3=Independent, 2=Needed Some Help, 1=Dependent, 8=Unknown, 9=Not Applicable",
  widget: W.GG_MATRIX,
  rows: [
    ["A", "A. Self-Care (bathing, dressing, toilet, eating)"],
    ["B", "B. Indoor Mobility (Ambulation)"],
    ["C", "C. Stairs (internal or external)"],
    ["D", "D. Functional Cognition (planning regular tasks)"],
  ].map(([letter, label]) => ({ fieldId: keyFor(letter), itemCode: `GG0100${letter}`, label, maxLength: 1 })),
});

export const gg0110 = (keys) =>
  checks(
    "GG0110",
    "Prior Device Use",
    keys,
    [
      "A. Manual wheelchair",
      "B. Motorized wheelchair and/or scooter",
      "C. Mechanical lift",
      "D. Walker",
      "E. Orthotics/prosthetics",
      "Z. None of the above",
    ],
    {
      description:
        "Indicate devices and aids used by the patient prior to the current illness, exacerbation, or injury. Check all that apply.",
      layout: "two-col",
    }
  );

export const ggLegend = () =>
  notice("GG-LEGEND", undefined, [
    "Coding Scale: 06=Independent, 05=Setup/clean-up assist, 04=Supervision/touching assist, 03=Partial/moderate assist, 02=Substantial/maximal assist, 01=Dependent",
    "If not attempted: 07=Patient refused, 09=Not applicable, 10=Environmental limitations, 88=Medical condition/safety concerns",
  ]);

const GG0130_ROWS = [
  ["A", "A. Eating: The ability to use suitable utensils to bring food and/or liquid to the mouth and swallow food and/or liquid once the meal is placed before the patient."],
  ["B", "B. Oral Hygiene: The ability to use suitable items to clean teeth. Dentures (if applicable): The ability to insert and remove dentures into and from mouth, and manage denture soaking and rinsing."],
  ["C", "C. Toileting Hygiene: The ability to maintain perineal hygiene, adjust clothes before and after voiding or having a bowel movement."],
  ["E", "E. Shower/bathe self: The ability to bathe self, including washing, rinsing, and drying self (excludes washing of back and hair). Does not include transferring in/out of tub/shower."],
  ["F", "F. Upper body dressing: The ability to dress and undress above the waist; including fasteners, if applicable."],
  ["G", "G. Lower body dressing: The ability to dress and undress below the waist, including fasteners; does not include footwear."],
  ["H", "H. Putting on/taking off footwear: The ability to put on and take off socks and shoes or other footwear that is appropriate for safe mobility; including fasteners, if applicable."],
];

export const gg0130 = (keyFor, { label, columnLabel }) => ({
  itemCode: "GG0130",
  label,
  widget: W.GG_MATRIX,
  columnLabel,
  rows: GG0130_ROWS.map(([letter, rowLabel]) => ({
    fieldId: keyFor(letter),
    itemCode: `GG0130${letter}`,
    label: rowLabel,
  })),
});

const WHEELCHAIR_TYPE_HINT = "1=Manual | 2=Motorized | -=Not assessed | ^=Skip";

// Legacy row order: A–S first, then Q, RR1, SS1 at the end.
const GG0170_ROWS = [
  ["A", "A. Roll left and right: The ability to roll from lying on back to left and right side, and return to lying on back on the bed."],
  ["B", "B. Sit to lying: The ability to move from sitting on side of bed to lying flat on the bed."],
  ["C", "C. Lying to sitting on side of bed: The ability to move from lying on the back to sitting on the side of the bed with no back support."],
  ["D", "D. Sit to stand: The ability to come to a standing position from sitting in a chair, wheelchair, or on the side of the bed."],
  ["E", "E. Chair/bed-to-chair transfer: The ability to transfer to and from a bed to a chair (or wheelchair)."],
  ["F", "F. Toilet transfer: The ability to get on and off a toilet or commode."],
  ["G", "G. Car transfer: The ability to transfer in and out of a car or van on the passenger side. Does not include the ability to open/close door or fasten seat belt."],
  ["I", "I. Walk 10 feet: Once standing, the ability to walk at least 10 feet in a room, corridor, or similar space, if coded 07, 09, 10 or 88 → Skip to GG0170M."],
  ["J", "J. Walk 50 feet with two turns: Once standing, the ability to walk 50 feet and make two turns."],
  ["K", "K. Walk 150 feet: Once standing, the ability to walk at least 150 feet in a corridor or similar space."],
  ["L", "L. Walking 10 feet on uneven surfaces: The ability to walk 10 feet on uneven or sloping surfaces (indoor or outdoor), such as turf or gravel."],
  ["M", "M. 1 step (curb): The ability to go up and down a curb or up and down one step, if coded 07, 09, 10 or 88 → Skip to GG0170P."],
  ["N", "N. 4 steps: The ability to go up and down four steps with or without a rail, if coded 07, 09, 10 or 88 → Skip to GG0170P."],
  ["O", "O. 12 steps: The ability to go up and down 12 steps with or without a rail."],
  ["P", "P. Picking up object: The ability to bend/stoop from a standing position to pick up a small object, such as a spoon, from the floor."],
  ["R", "R. Wheel 50 feet with two turns: Once seated in wheelchair/scooter, the ability to wheel at least 50 feet and make two turns."],
  ["S", "S. Wheel 150 feet: Once seated in wheelchair/scooter, the ability to wheel at least 150 feet in a corridor or similar space."],
  ["Q", "Q. Does patient use wheelchair and/or scooter?", { maxLength: 1, hint: "0 = No → Skip to M1033 | 1 = Yes → Continue to RR1" }],
  ["RR1", "RR1. Indicate the type of wheelchair or scooter used — 50 feet with two turns", { hint: WHEELCHAIR_TYPE_HINT }],
  ["SS1", "SS1. Indicate the type of wheelchair or scooter used — 150 feet", { hint: WHEELCHAIR_TYPE_HINT }],
];

export const gg0170 = (keyFor, { label, columnLabel }) => ({
  itemCode: "GG0170",
  label,
  widget: W.GG_MATRIX,
  columnLabel,
  rows: GG0170_ROWS.map(([letter, rowLabel, extra]) => ({
    fieldId: keyFor(letter),
    itemCode: `GG0170${letter}`,
    label: rowLabel,
    ...extra,
  })),
});

export const m1600 = (fieldId) =>
  coded(
    "M1600",
    fieldId,
    "Has this patient been treated for a Urinary Tract Infection in the past 14 days?",
    [
      ["0", "No"],
      ["1", "Yes"],
      ["NA", "Patient on prophylactic treatment"],
      ["UK", "Unknown"],
    ],
    { maxLength: 2 }
  );

export const m1610 = (fieldId) =>
  coded("M1610", fieldId, "Urinary Incontinence or Urinary Catheter Presence", [
    ["0", "No incontinence or catheter (includes anuria or ostomy for urinary drainage)"],
    ["1", "Patient is incontinent"],
    ["2", "Patient requires a urinary catheter (specifically: external, indwelling, intermittent, or suprapubic)"],
  ]);

export const m1620 = (fieldId) =>
  coded(
    "M1620",
    fieldId,
    "Bowel Incontinence Frequency",
    [
      ["0", "Very rarely or never has bowel incontinence"],
      ["1", "Less than once weekly"],
      ["2", "One to three times weekly"],
      ["3", "Four to six times weekly"],
      ["4", "On a daily basis"],
      ["5", "More often than once daily"],
      ["NA", "Patient has ostomy for bowel elimination"],
      ["UK", "Unknown"],
    ],
    { maxLength: 2 }
  );

export const m1630 = (fieldId) =>
  coded(
    "M1630",
    fieldId,
    "Ostomy for Bowel Elimination",
    [
      ["0", "Patient does not have an ostomy for bowel elimination."],
      ["1", "Patient's ostomy was not related to an inpatient stay and did not necessitate change in medical or treatment regimen."],
      ["2", "The ostomy was related to an inpatient stay or did necessitate change in medical or treatment regimen."],
    ],
    {
      description:
        "Does this patient have an ostomy for bowel elimination that (within the last 14 days): a) was related to an inpatient facility stay; or b) necessitated a change in medical or treatment regimen?",
    }
  );
