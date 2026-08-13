import { FIELD_WIDGETS } from "../engine/schema";
import { YES_NO } from "./shared/optionSets";

// FU (Follow-up) — the smallest of the 6 forms: 6 sections, no wizard extras, no
// coding-assistant. Transcribed directly from caremagix-fe/oasis-fu.html (Phase 1
// Step 1). Field ids kept exactly as legacy sends them, including its inconsistency
// (GG0170Q has no underscore, every other GG0170 row does) — aerial-view doc §G.

const gFunctionalItems = [
  {
    itemCode: "M1800", fieldId: "M1800", label: "Grooming",
    widget: FIELD_WIDGETS.CODED_RADIO, maxLength: 2,
    options: [
      { value: "0", label: "Able to groom self unaided." },
      { value: "1", label: "Grooming utensils must be placed within reach." },
      { value: "2", label: "Someone must assist the patient to groom self." },
      { value: "3", label: "Patient depends entirely upon someone else for grooming needs." },
    ],
  },
  {
    itemCode: "M1810", fieldId: "M1810", label: "Current Ability to Dress Upper Body",
    widget: FIELD_WIDGETS.CODED_RADIO, maxLength: 2,
    options: [
      { value: "0", label: "Able to get clothes out of closets and drawers without assistance." },
      { value: "1", label: "Able to dress upper body without assistance if clothing is laid out." },
      { value: "2", label: "Someone must help the patient put on upper body clothing." },
      { value: "3", label: "Patient depends entirely upon another person to dress the upper body." },
    ],
  },
  {
    itemCode: "M1820", fieldId: "M1820", label: "Current Ability to Dress Lower Body",
    widget: FIELD_WIDGETS.CODED_RADIO, maxLength: 2,
    options: [
      { value: "0", label: "Able to obtain, put on, and remove clothing and shoes without assistance." },
      { value: "1", label: "Able to dress lower body without assistance if clothing and shoes are laid out." },
      { value: "2", label: "Someone must help the patient put on undergarments, slacks, socks or nylons, and shoes." },
      { value: "3", label: "Patient depends entirely upon another person to dress lower body." },
    ],
  },
  {
    itemCode: "M1830", fieldId: "M1830", label: "Bathing",
    widget: FIELD_WIDGETS.CODED_RADIO, maxLength: 2,
    options: [
      { value: "0", label: "Able to bathe self in shower or tub independently." },
      { value: "1", label: "With use of devices, able to bathe self in shower or tub independently." },
      { value: "2", label: "Able to bathe in shower or tub with intermittent assistance of another person." },
      { value: "3", label: "Requires presence of another person throughout the bath." },
      { value: "4", label: "Unable to use shower or tub, but able to bathe self at sink, in chair, or on commode." },
      { value: "5", label: "Unable to use shower or tub, but able to participate in bathing with assistance." },
      { value: "6", label: "Unable to participate effectively in bathing." },
    ],
  },
  {
    itemCode: "M1840", fieldId: "M1840", label: "Toilet Transferring",
    widget: FIELD_WIDGETS.CODED_RADIO, maxLength: 2,
    options: [
      { value: "0", label: "Able to get to and from the toilet and transfer independently." },
      { value: "1", label: "When reminded or assisted, able to get to and from the toilet and transfer." },
      { value: "2", label: "Unable to get to toilet but able to use bedside commode." },
      { value: "3", label: "Unable to get to toilet or commode but able to use bedpan/urinal independently." },
      { value: "4", label: "Is totally dependent in toileting." },
    ],
  },
  {
    itemCode: "M1850", fieldId: "M1850", label: "Transferring",
    widget: FIELD_WIDGETS.CODED_RADIO, maxLength: 2,
    options: [
      { value: "0", label: "Able to independently transfer." },
      { value: "1", label: "Able to transfer with minimal human assistance or assistive device." },
      { value: "2", label: "Able to bear weight and pivot but unable to transfer self." },
      { value: "3", label: "Unable to transfer self and unable to bear weight or pivot." },
      { value: "4", label: "Bedfast, unable to transfer but able to turn and position self in bed." },
      { value: "5", label: "Bedfast, unable to transfer and unable to turn and position self." },
    ],
  },
  {
    itemCode: "M1860", fieldId: "M1860", label: "Ambulation/Locomotion",
    widget: FIELD_WIDGETS.CODED_RADIO, maxLength: 2,
    options: [
      { value: "0", label: "Able to independently walk on even and uneven surfaces." },
      { value: "1", label: "With one-handed device, able to independently walk on even and uneven surfaces." },
      { value: "2", label: "Requires two-handed device to walk alone on a level surface." },
      { value: "3", label: "Able to walk only with supervision or assistance at all times." },
      { value: "4", label: "Chairfast, unable to ambulate but able to wheel self independently." },
      { value: "5", label: "Chairfast, unable to ambulate and unable to wheel self." },
      { value: "6", label: "Bedfast, unable to ambulate or be up in a chair." },
    ],
  },
];

export const fuSchema = {
  formKey: "OASIS-E2-FU",
  formType: "FU",
  sections: [
    {
      id: "cover",
      label: "Cover",
      items: [], // PRA notice only — no clinical fields, matches legacy's cover page
    },
    {
      id: "A",
      label: "A · Admin",
      items: [
        {
          itemCode: "M0080", fieldId: "M0080", label: "Discipline of Person Completing Assessment",
          widget: FIELD_WIDGETS.CODED_RADIO, maxLength: 2,
          options: [
            { value: "1", label: "RN" },
            { value: "2", label: "PT" },
            { value: "3", label: "SLP/ST" },
            { value: "4", label: "OT" },
          ],
        },
        {
          itemCode: "M0090", fieldId: "M0090", label: "Date Assessment Completed",
          widget: FIELD_WIDGETS.SPLIT_DATE,
        },
        {
          itemCode: "M0100", fieldId: "M0100",
          label: "This Assessment is Currently Being Completed for the Following Reason",
          widget: FIELD_WIDGETS.CODED_RADIO, maxLength: 2,
          options: [
            { value: "1", label: "Start of care — further visits planned" },
            { value: "3", label: "Resumption of Care (after inpatient stay)" },
            { value: "4", label: "Recertification (follow-up) reassessment" },
            { value: "5", label: "Other follow-up" },
            { value: "6", label: "Transferred to an inpatient facility — patient not discharged from agency" },
            { value: "7", label: "Transferred to an inpatient facility — patient discharged from agency" },
            { value: "8", label: "Death at home" },
            { value: "9", label: "Discharge from agency" },
          ],
        },
      ],
    },
    {
      id: "G",
      label: "G · Functional",
      items: gFunctionalItems,
    },
    {
      id: "GG",
      label: "GG · Abilities",
      items: [
        {
          itemCode: "GG0130", label: "GG0130 — Self-Care (Follow-up Performance)",
          widget: FIELD_WIDGETS.GG_MATRIX, columnLabel: "Code (01–06, 07, 09, 10, 88)",
          rows: [
            { fieldId: "GG0130_A", itemCode: "GG0130_A", label: "A. Eating" },
            { fieldId: "GG0130_B", itemCode: "GG0130_B", label: "B. Oral Hygiene" },
            { fieldId: "GG0130_C", itemCode: "GG0130_C", label: "C. Toileting Hygiene" },
          ],
        },
        {
          itemCode: "GG0170", label: "GG0170 — Mobility (Follow-up Performance)",
          widget: FIELD_WIDGETS.GG_MATRIX, columnLabel: "Code (01–06, 07, 09, 10, 88)",
          rows: [
            { fieldId: "GG0170_A", itemCode: "GG0170_A", label: "A. Roll left and right" },
            { fieldId: "GG0170_B", itemCode: "GG0170_B", label: "B. Sit to lying" },
            { fieldId: "GG0170_C", itemCode: "GG0170_C", label: "C. Lying to sitting on side of bed" },
            { fieldId: "GG0170_D", itemCode: "GG0170_D", label: "D. Sit to stand" },
            { fieldId: "GG0170_E", itemCode: "GG0170_E", label: "E. Chair/bed-to-chair transfer" },
            { fieldId: "GG0170_F", itemCode: "GG0170_F", label: "F. Toilet transfer" },
            { fieldId: "GG0170_I", itemCode: "GG0170_I", label: "I. Walk 10 feet (if coded 07, 09, 10 or 88 → skip to M)" },
            { fieldId: "GG0170_J", itemCode: "GG0170_J", label: "J. Walk 50 feet with two turns" },
            { fieldId: "GG0170_L", itemCode: "GG0170_L", label: "L. Walking 10 feet on uneven surfaces" },
            { fieldId: "GG0170_M", itemCode: "GG0170_M", label: "M. 1 step (curb) (if coded 07, 09, 10 or 88 → skip to Q)" },
            { fieldId: "GG0170_N", itemCode: "GG0170_N", label: "N. 4 steps" },
            // legacy: id="GG0170Q" — no underscore, unlike every other row here (kept as-is, §G)
            { fieldId: "GG0170Q", itemCode: "GG0170Q", label: "Q. Does patient use wheelchair and/or scooter? (0 = No → skip to M1033; 1 = Yes → continue to R)" },
            { fieldId: "GG0170_R", itemCode: "GG0170_R", label: "R. Wheel 50 feet with two turns" },
          ],
        },
      ],
    },
    {
      id: "J",
      label: "J · Health Cond.",
      items: [
        {
          itemCode: "M1033",
          label: "Risk for Hospitalization — Check all that apply",
          widget: FIELD_WIDGETS.CHECKBOX_GROUP, layout: "two-col",
          checkboxOptions: [
            { fieldId: "M1033_HOSP_RISK_HSTRY_FALLS", itemCode: "M1033_HOSP_RISK_HSTRY_FALLS", label: "1. History of falls (2 or more falls — or any fall with an injury — in the past 12 months)" },
            { fieldId: "M1033_HOSP_RISK_WEIGHT_LOSS", itemCode: "M1033_HOSP_RISK_WEIGHT_LOSS", label: "2. Unintentional weight loss of a total of 10 pounds or more in the last 12 months" },
            { fieldId: "M1033_HOSP_RISK_MLTPL_HOSPZTN", itemCode: "M1033_HOSP_RISK_MLTPL_HOSPZTN", label: "3. Multiple hospitalizations (2 or more) in the past 6 months" },
            { fieldId: "M1033_HOSP_RISK_MLTPL_ED_VISIT", itemCode: "M1033_HOSP_RISK_MLTPL_ED_VISIT", label: "4. Multiple emergency department visits (2 or more) in the past 6 months" },
            { fieldId: "M1033_HOSP_RISK_MNTL_BHV_DCLN", itemCode: "M1033_HOSP_RISK_MNTL_BHV_DCLN", label: "5. Decline in mental, emotional, or behavioral status in the past 3 months" },
            { fieldId: "M1033_HOSP_RISK_COMPLIANCE", itemCode: "M1033_HOSP_RISK_COMPLIANCE", label: "6. Reported or observed history of difficulty complying with any medical instructions in the past 3 months" },
            { fieldId: "M1033_HOSP_RISK_5PLUS_MDCTN", itemCode: "M1033_HOSP_RISK_5PLUS_MDCTN", label: "7. Currently taking 5 or more medications" },
            { fieldId: "M1033_HOSP_RISK_CRNT_EXHSTN", itemCode: "M1033_HOSP_RISK_CRNT_EXHSTN", label: "8. Currently reports exhaustion" },
            { fieldId: "M1033_HOSP_RISK_OTHR_RISK", itemCode: "M1033_HOSP_RISK_OTHR_RISK", label: "9. Other risk(s) not listed in 1–8" },
            { fieldId: "M1033_HOSP_RISK_NONE_ABOVE", itemCode: "M1033_HOSP_RISK_NONE_ABOVE", label: "10. None of the above" },
          ],
        },
      ],
    },
    {
      id: "M",
      label: "M · Skin",
      items: [
        {
          itemCode: "M1306", fieldId: "M1306",
          label: "Does this patient have at least one Unhealed Pressure Ulcer/Injury at Stage 2 or Higher or designated as Unstageable?",
          widget: FIELD_WIDGETS.CODED_RADIO, maxLength: 1,
          options: YES_NO,
        },
        {
          itemCode: null, label: "Send for Review",
          widget: FIELD_WIDGETS.EMAIL_ACTION,
        },
      ],
    },
  ],
};

export default fuSchema;
