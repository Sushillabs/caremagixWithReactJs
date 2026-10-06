import { FIELD_WIDGETS, LEGACY_ENGINES } from "../engine/schema";
import * as admin from "./shared/questions/admin";
import * as health from "./shared/questions/health";
import * as meds from "./shared/questions/skinMeds";
import { markWhen } from "./shared/skipRules";

// Field keys and max lengths are legacy oasis_dah.html's, unchanged. DAH ran on its own
// rule engine (oasis-dah-rule.js), not oasis-core.js, and uses two-digit M0080/M0100 codes.
export const dahSchema = {
  formKey: "OASIS-E2-DAH",
  formType: "DAH",
  title: "Death at Home Assessment",
  legacyEngine: LEGACY_ENGINES.RULE,
  skipMarks: [markWhen("J1800", "0", ["J1900A", "J1900B", "J1900C"])],
  sections: [
    {
      id: "cover",
      label: "Cover",
      items: admin.coverNotices({
        title: "OASIS-E2 Death at Home (DAH) Assessment",
        pages: "1–3 of 3",
        formNote:
          "DAH Note: This Death at Home assessment is administered when a patient dies at home. M0100 is automatically coded 08 (Death at home), TRANS_TYPE_CD = 1 (Add new record).",
      }),
    },
    {
      id: "A",
      label: "A · Admin",
      items: [
        admin.m0080("M0080_ASSESSOR_DISCIPLINE", { twoDigitCodes: true }),
        admin.m0090("M0090_INFO_COMPLETED_DT"),
        admin.m0100("M0100_ASSMT_REASON", { twoDigitCodes: true, defaultValue: "08" }),
        admin.m0906("M0906_DC_TRAN_DTH_DT"),
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
      items: [
        meds.m2005("M2005_MDCTN_INTRVTN", { maxLength: 2 }),
        { itemCode: null, label: "Send for Review", widget: FIELD_WIDGETS.EMAIL_ACTION },
      ],
    },
  ],
};

export default dahSchema;
