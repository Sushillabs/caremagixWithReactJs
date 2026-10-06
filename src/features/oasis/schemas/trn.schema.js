import { FIELD_WIDGETS, LEGACY_ENGINES } from "../engine/schema";
import * as admin from "./shared/questions/admin";
import * as health from "./shared/questions/health";
import * as meds from "./shared/questions/skinMeds";
import * as td from "./shared/questions/transferDischarge";
import { markWhen } from "./shared/skipRules";

const M2310_KEYS = ["M2310_ECR_MEDICATION", "M2310_ECR_HYPOGLYC", "M2310_ECR_OTHER", "M2310_ECR_UNKNOWN"];
const A2122_KEYS = ["A2122A", "A2122B", "A2122C", "A2122D", "A2122E"];

// Field keys and max lengths are legacy oasis_trn.html's, unchanged. TRN ran on
// oasis-trn-rule.js, which is DAH's engine line for line apart from the skip rules.
export const trnSchema = {
  formKey: "OASIS-E2-TRN",
  formType: "TRN",
  title: "Transfer to an Inpatient Facility",
  legacyEngine: LEGACY_ENGINES.RULE,
  // Same order as legacy applySkipPatternsToRaw_TRN.
  skipMarks: [
    markWhen("M2301_EMER_USE_AFTR_LAST_ASMT", ["0", "UK"], M2310_KEYS),
    markWhen("A2120", ["0", "2"], A2122_KEYS),
    markWhen("J1800", "0", ["J1900A", "J1900B", "J1900C"]),
    markWhen("M1041_IN_INFLNZ_SEASON", "0", ["M1046_INFLNZ_RECD_CRNT_SEASON"]),
  ],
  sections: [
    {
      id: "cover",
      label: "Cover",
      items: admin.coverNotices({
        title: "OASIS-E2 Transfer to an Inpatient Facility (TRN)",
        pages: "1–5 of 5",
        formNote:
          "TRN Note: This Transfer assessment is administered when a patient is transferred to an inpatient facility. M0100 defaults to 06 (transferred, not discharged); change to 07 if patient is discharged from agency. TRANS_TYPE_CD = 1.",
      }),
    },
    {
      id: "A",
      label: "A · Admin",
      items: [
        admin.m0080("M0080_ASSESSOR_DISCIPLINE", { twoDigitCodes: true }),
        admin.m0090("M0090_INFO_COMPLETED_DT"),
        admin.m0100("M0100_ASSMT_REASON", { twoDigitCodes: true, defaultValue: "06" }),
        admin.m0906("M0906_DC_TRAN_DTH_DT"),
        td.m2301("M2301_EMER_USE_AFTR_LAST_ASMT", { maxLength: 2 }),
        td.m2310(M2310_KEYS),
        td.m2410("M2410_INPAT_FACILITY", { maxLength: 2 }),
        td.a2120("A2120", { maxLength: 2 }),
        td.a2122(A2122_KEYS),
      ],
    },
    {
      id: "J",
      label: "J · Health",
      items: [health.j1800("J1800", { maxLength: 2 }), health.j1900((letter) => `J1900${letter}`)],
    },
    {
      id: "N",
      label: "N · Medications",
      items: [meds.m2005("M2005_MDCTN_INTRVTN", { maxLength: 2 })],
    },
    {
      id: "O",
      label: "O · Special Tx",
      items: [
        td.m1041("M1041_IN_INFLNZ_SEASON", { maxLength: 2 }),
        td.m1046("M1046_INFLNZ_RECD_CRNT_SEASON", { maxLength: 2 }),
      ],
    },
    {
      id: "Q",
      label: "Q · Goal Setting",
      items: [
        td.m2401([
          "M2401_INTRVTN_SMRY_FALL_PRVNT",
          "M2401_INTRVTN_SMRY_DPRSN",
          "M2401_INTRVTN_SMRY_PAIN_MNTR",
          "M2401_INTRVTN_SMRY_PRSULC_PRVN",
          "M2401_INTRVTN_SMRY_PRSULC_WET",
        ]),
        { itemCode: null, label: "Send for Review", widget: FIELD_WIDGETS.EMAIL_ACTION },
      ],
    },
  ],
};

export default trnSchema;
