import { FIELD_WIDGETS as W } from "../../../engine/schema";
import { coded, checks, splitDate, pairedCheckbox, notice } from "./helpers";

export const coverNotices = ({ title, pages }) => [
  notice("COVER-HEADER", title, [
    "Outcome and Assessment Information Set · Version E2",
    "Effective: 04/01/2026",
    "Agency: Centers for Medicare & Medicaid Services",
    `Pages: ${pages}`,
  ]),
  notice("PRA-NOTICE", "Paperwork Reduction Act Disclosure", [
    "According to the Paperwork Reduction Act of 1995, no persons are required to respond to a collection of information unless it displays a valid OMB control number. The valid OMB control number for this information collection is XXXX-XXXX. The time required to complete this information collection is estimated to be XX minutes per data element, including the time to review instructions, search existing data resources, gather the data needed, and complete and review the information collection.",
  ]),
  notice(
    "CMS-DISCLAIMER",
    undefined,
    [
      "CMS Disclaimer: Please do not send applications, claims, payments, medical records or any documents containing sensitive information to the PRA Reports Clearance Office.",
    ],
    { variant: "warn" }
  ),
];

export const m0032 = (fieldId, naFieldId) =>
  splitDate("M0032", fieldId, "Resumption of Care Date", {
    pairedField: pairedCheckbox(naFieldId, "NA — Not Applicable"),
  });

export const a1110a = (fieldId) => ({
  itemCode: "A1110A",
  fieldId,
  label: "Language — What is your preferred language?",
  widget: W.TEXT,
  placeholder: "Enter preferred language",
});

export const a1110b = (fieldId, extra = {}) =>
  coded(
    "A1110B",
    fieldId,
    "Language — Do you need or want an interpreter to communicate with a doctor or health care staff?",
    [
      ["0", "No"],
      ["1", "Yes"],
      ["9", "Unable to determine"],
    ],
    extra
  );

export const m0080 = (fieldId) =>
  coded("M0080", fieldId, "Discipline of Person Completing Assessment", [
    ["1", "RN"],
    ["2", "PT"],
    ["3", "SLP/ST"],
    ["4", "OT"],
  ]);

export const m0090 = (fieldId) => splitDate("M0090", fieldId, "Date Assessment Completed");

export const m0100 = (fieldId) =>
  coded(
    "M0100",
    fieldId,
    "This Assessment is Currently Being Completed for the Following Reason",
    [
      ["1", "Start of care — further visits planned", "Start/Resumption of Care"],
      ["3", "Resumption of Care (after inpatient stay)"],
      ["4", "Recertification (follow-up) reassessment", "Follow-up"],
      ["5", "Other follow-up"],
      ["6", "Transferred to an inpatient facility — patient not discharged from agency", "Transfer to an Inpatient Facility"],
      ["7", "Transferred to an inpatient facility — patient discharged from agency"],
      ["8", "Death at home", "Discharge from Agency"],
      ["9", "Discharge from agency"],
    ],
    { maxLength: 2 }
  );

export const m0102 = (fieldId, naFieldId) =>
  splitDate("M0102", fieldId, "Date of Physician-ordered Start of Care (Resumption of Care)", {
    description:
      "If the physician indicated a specific start of care (resumption of care) date when the patient was referred for home health services, record the date specified.",
    pairedField: pairedCheckbox(naFieldId, "NA — No specific SOC/ROC date ordered by physician"),
    note: "→ Skip to A1255, Transportation, if date entered",
  });

export const m0104 = (fieldId) =>
  splitDate("M0104", fieldId, "Date of Referral", {
    description:
      "Indicate the date that the written or verbal referral for initiation or resumption of care was received by the HHA.",
  });

export const a1255 = (fieldId) =>
  coded(
    "A1255",
    fieldId,
    "Transportation",
    [
      ["0", "Yes"],
      ["1", "No"],
      ["7", "Patient declines to respond"],
      ["8", "Patient unable to respond"],
    ],
    {
      description:
        "In the past 12 months, has lack of reliable transportation kept you from medical appointments, meetings, work or from getting things needed for daily living?",
      note: "Questions on transportation and housing have been derived from the national PRAPARE® social drivers of health assessment tool (2016), owned by NACHC.",
    }
  );

export const m1000 = (keys) =>
  checks(
    "M1000",
    "From which of the following Inpatient Facilities was the patient discharged within the past 14 days?",
    keys,
    [
      "1. Long-term nursing facility (NF)",
      "2. Skilled nursing facility (SNF/TCU)",
      "3. Short-stay acute hospital (IPPS)",
      "4. Long-term care hospital (LTCH)",
      "5. Inpatient rehabilitation hospital or unit (IRF)",
      "6. Psychiatric hospital or unit",
      "7. Other (specify)",
      "NA. Patient was not discharged from an inpatient facility → Skip to B0200. Hearing",
    ],
    { description: "Check all that apply.", layout: "two-col" }
  );

export const m1005 = (fieldId, ukFieldId) =>
  splitDate("M1005", fieldId, "Inpatient Discharge Date (most recent)", {
    pairedField: pairedCheckbox(ukFieldId, "UK — Unknown or Not Available"),
  });
