import { FIELD_WIDGETS } from "../engine/schema";
import { keysOf } from "./shared/questions/helpers";
import { markWhen, markWhenFilled, dateParts, GG_NOT_ATTEMPTED } from "./shared/skipRules";
import * as admin from "./shared/questions/admin";
import * as cog from "./shared/questions/cognitionMood";
import * as fn from "./shared/questions/function";
import * as health from "./shared/questions/health";
import * as skin from "./shared/questions/skinMeds";

// Field keys are legacy oasis-roc.html's data-field strings, unchanged. Its oddities are
// deliberate: "GG0170Q" has no underscore, M0032's NA box is "M0032_NA_ROC", and A1110B
// also ships under its radio name (radioAlias).
const gg0170Key = (letter) => (letter === "Q" ? "GG0170Q" : `GG0170_${letter}`);

const GG_COLUMN = "SOC/ROC Code (01–06, 07, 09, 10, 88)";

export const rocSchema = {
  formKey: "OASIS-E2-ROC",
  formType: "ROC",
  title: "Resumption of Care Assessment",
  // Same order as legacy applySkipPatternsToRaw_ROC. The two NA rules compare with "1" while
  // the checkbox value is a boolean, so they never fire — in legacy too. Kept as-is.
  skipMarks: [
    markWhen("M0102_NA", "1", dateParts("M0102")),
    markWhenFilled("M0102_month", dateParts("M0104")),
    markWhen("M1000_NA", "1", [...dateParts("M1005"), "M1005_UK"]),
    markWhen("C0100", "0", ["C0200", "C0300A", "C0300B", "C0300C", "C0400A", "C0400B", "C0400C", "C0500"]),
    markWhen("J0510", "0", ["J0520", "J0530"]),
    markWhen("GG0170_I", GG_NOT_ATTEMPTED, ["GG0170_J", "GG0170_K", "GG0170_L"]),
    markWhen("GG0170_M", GG_NOT_ATTEMPTED, ["GG0170_N", "GG0170_O"]),
    markWhen("GG0170_N", GG_NOT_ATTEMPTED, ["GG0170_O"]),
    markWhen("GG0170Q", "0", ["GG0170_R", "GG0170_RR1", "GG0170_S", "GG0170_SS1"]),
    markWhen("M1306", "0", keysOf("M1311_", ["A1", "B1", "C1", "D1", "E1", "F1"])),
    markWhen("M1330", ["0", "3"], ["M1332", "M1334"]),
    markWhen("M1340", ["0", "2"], ["M1342"]),
    markWhen("M2001", "0", ["M2003"]),
    markWhen("M2001", "9", ["M2003", "M2010"]),
  ],
  sections: [
    {
      id: "cover",
      label: "Cover",
      items: admin.coverNotices({
        title: "OASIS-E2 Resumption of Care (ROC) Assessment",
        pages: "1–21 of 21",
      }),
    },
    {
      id: "A",
      label: "A · Admin",
      items: [
        admin.m0032("M0032", "M0032_NA_ROC"),
        admin.a1110a("A1110_A"),
        admin.a1110b("A1110_B", { radioAlias: "A1110B" }),
        admin.m0080("M0080"),
        admin.m0090("M0090"),
        admin.m0100("M0100"),
        admin.m0102("M0102", "M0102_NA"),
        admin.m0104("M0104"),
        admin.a1255("A1255"),
        admin.m1000(keysOf("M1000_", [1, 2, 3, 4, 5, 6, 7, "NA"])),
        admin.m1005("M1005", "M1005_UK"),
      ],
    },
    {
      id: "B",
      label: "B · Hearing/Vision",
      items: [cog.b0200("B0200"), cog.b1000("B1000"), cog.b1300("B1300")],
    },
    {
      id: "C",
      label: "C · Cognition",
      items: [
        cog.c0100("C0100"),
        cog.bimsHeading(),
        cog.c0200("C0200"),
        cog.c0300a("C0300A"),
        cog.c0300b("C0300B"),
        cog.c0300c("C0300C"),
        cog.c0400a("C0400A"),
        cog.c0400b("C0400B"),
        cog.c0400c("C0400C"),
        cog.c0500("C0500"),
        cog.deliriumHeading(),
        cog.c1310a("C1310A"),
        cog.c1310b("C1310B"),
        cog.c1310c("C1310C"),
        cog.c1310d("C1310D"),
        cog.m1700("M1700"),
        cog.m1710("M1710"),
        cog.m1720("M1720"),
      ],
    },
    {
      id: "D",
      label: "D · Mood",
      items: [cog.d0150((letter, column) => `D0150_${letter}${column}`), cog.d0160("D0160"), cog.d0700("D0700")],
    },
    {
      id: "E",
      label: "E · Behavior",
      items: [cog.m1740(keysOf("M1740_", [1, 2, 3, 4, 5, 6, 7])), cog.m1745("M1745")],
    },
    {
      id: "F",
      label: "F · Living/Assist.",
      items: [fn.m1100("M1100"), fn.m2102f("M2102f")],
    },
    {
      id: "G",
      label: "G · Functional",
      items: fn.gFunctionalItems((itemCode) => itemCode),
    },
    {
      id: "GG",
      label: "GG · Abilities",
      items: [
        fn.gg0100((letter) => `GG0100_${letter}`),
        fn.gg0110(keysOf("GG0110_", ["A", "B", "C", "D", "E", "Z"])),
        fn.ggLegend(),
        fn.gg0130((letter) => `GG0130_${letter}`, {
          label: "GG0130 — Self-Care (SOC/ROC Performance)",
          columnLabel: GG_COLUMN,
        }),
        fn.gg0170(gg0170Key, {
          label: "GG0170 — Mobility (SOC/ROC Performance)",
          columnLabel: GG_COLUMN,
        }),
      ],
    },
    {
      id: "H",
      label: "H · Bladder/Bowel",
      items: [fn.m1600("M1600"), fn.m1610("M1610"), fn.m1620("M1620"), fn.m1630("M1630")],
    },
    {
      id: "I",
      label: "I · Diagnoses",
      items: [
        health.diagnoses(
          ["M1021_A", "M1023_B", "M1023_C", "M1023_D", "M1023_E", "M1023_F"].map((icdFieldId) => ({
            icdFieldId,
            severityFieldId: `${icdFieldId}_sev`,
          }))
        ),
        health.m1028(keysOf("M1028_", [1, 2, 3])),
      ],
    },
    {
      id: "J",
      label: "J · Health Cond.",
      items: [
        health.m1033(keysOf("M1033_", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])),
        health.j0510("J0510"),
        health.j0520("J0520"),
        health.j0530("J0530"),
        health.m1400("M1400"),
      ],
    },
    {
      id: "K",
      label: "K · Nutrition",
      items: [
        health.m1060Height("M1060_A"),
        health.m1060Weight("M1060_B"),
        health.k0520(keysOf("K0520_", ["A", "B", "C", "D", "Z"], "_adm"), {
          label: "Nutritional Approaches — On Admission",
          description: "Check all of the nutritional approaches that apply on admission.",
        }),
        health.m1870("M1870"),
      ],
    },
    {
      id: "M",
      label: "M · Skin",
      items: [
        skin.m1306("M1306"),
        skin.m1311(keysOf("M1311_", ["A1", "B1", "C1", "D1", "E1", "F1"])),
        skin.m1322("M1322"),
        skin.m1324("M1324"),
        skin.m1330("M1330"),
        skin.m1332("M1332"),
        skin.m1334("M1334"),
        skin.m1340("M1340"),
        skin.m1342("M1342"),
      ],
    },
    {
      id: "N",
      label: "N · Medications",
      items: [
        skin.n0415((letter, column) => `N0415_${letter}_${column}`, "N0415_Z"),
        skin.m2001("M2001"),
        skin.m2003("M2003"),
        skin.m2010("M2010"),
        skin.m2020("M2020"),
        skin.m2030("M2030"),
      ],
    },
    {
      id: "O",
      label: "O · Special Tx",
      items: [
        skin.o0110((code) => `O0110_${code}`, {
          label: "Special Treatments, Procedures, and Programs (SOC/ROC)",
          description: "Check all of the following treatments, procedures, and programs that apply on admission.",
        }),
        { itemCode: null, label: "Send for Review", widget: FIELD_WIDGETS.EMAIL_ACTION },
      ],
    },
  ],
};

export default rocSchema;
