import { FIELD_WIDGETS as W, LEGACY_ENGINES } from "../engine/schema";
import { keysOf, opts, twoDigitCodes, withMaxLength } from "./shared/questions/helpers";
import * as admin from "./shared/questions/admin";
import * as cog from "./shared/questions/cognitionMood";
import * as fn from "./shared/questions/function";
import * as health from "./shared/questions/health";
import * as skin from "./shared/questions/skinMeds";
import { markWhen, markWhenFilled, dateParts, GG_NOT_ATTEMPTED } from "./shared/skipRules";

// Field keys, option codes and max lengths are legacy oasis-soc-rule.html's, unchanged. SOC runs
// on the rule engine (checkboxes "1"/"0", _meta on save). Its code boxes are 2 characters wide
// and many items use zero-padded codes; C0500, D0160, M1060 and M1311 are text boxes, not numbers.
const len2 = (field) => withMaxLength(field, 2);
const asText = (field, maxLength) => ({ ...field, widget: W.TEXT, maxLength, range: undefined, unit: undefined });

const G_KEYS = {
  M1800: "M1800_CRNT_GROOMING",
  M1810: "M1810_CRNT_DRESS_UPPER",
  M1820: "M1820_CRNT_DRESS_LOWER",
  M1830: "M1830_CRNT_BATHG",
  M1840: "M1840_CRNT_TOILTG",
  M1845: "M1845_CRNT_TOILTG_HYGN",
  M1850: "M1850_CRNT_TRNSFRNG",
  M1860: "M1860_CRNT_AMBLTN",
};
const GG0170_KEYS = { C: "GG0170C_MOBILITY_SOCROC_PERF", Q: "GG0170Q1", RR1: "GG0170RR1", SS1: "GG0170SS1" };
const gg0170Key = (letter) => GG0170_KEYS[letter] ?? `GG0170${letter}1`;
const GG_COLUMN = "SOC Code (01–06, 07, 09, 10, 88)";

const M0102 = "M0102_PHYSN_ORDRD_SOCROC_DT";
const M1311_KEYS = [
  "M1311_NBR_PRSULC_STG2_A1",
  "M1311_NBR_PRSULC_STG3_B1",
  "M1311_NBR_PRSULC_STG4_C1",
  "M1311_NSTG_DRSG_D1",
  "M1311_NSTG_CVRG_E1",
  "M1311_NSTG_DEEP_TSUE_F1",
];
const DELIRIUM_CODES = opts([
  ["0", "Behavior not present"],
  ["1", "Behavior continuously present, does not fluctuate"],
  ["2", "Behavior present, fluctuates (comes and goes)"],
]);

export const socSchema = {
  formKey: "OASIS-E2-SOC",
  formType: "SOC",
  title: "Start of Care Assessment",
  legacyEngine: LEGACY_ENGINES.RULE,
  // Same order as legacy applySkipPatternsToRaw_SOC. Unlike ROC, the two NA rules do fire here,
  // because SOC checkboxes are "1"/"0".
  skipMarks: [
    markWhen(`${M0102}_NA`, "1", dateParts(M0102)),
    markWhenFilled(`${M0102}_month`, dateParts("M0104_PHYSN_RFRL_DT")),
    markWhen("M1000_DC_NONE_14_DA", "1", [...dateParts("M1005_INP_DISCHARGE_DT"), "M1005_INP_DSCHG_UNKNOWN"]),
    markWhen("C0100", "0", ["C0200", "C0300A", "C0300B", "C0300C", "C0400A", "C0400B", "C0400C", "C0500"]),
    markWhen("J0510", "0", ["J0520", "J0530"]),
    markWhen("GG0170I1", GG_NOT_ATTEMPTED, ["GG0170J1", "GG0170K1", "GG0170L1"]),
    markWhen("GG0170M1", GG_NOT_ATTEMPTED, ["GG0170N1", "GG0170O1"]),
    markWhen("GG0170N1", GG_NOT_ATTEMPTED, ["GG0170O1"]),
    markWhen("GG0170Q1", "0", ["GG0170R1", "GG0170RR1", "GG0170S1", "GG0170SS1"]),
    markWhen("M1306_UNHLD_STG2_PRSR_ULCR", "0", M1311_KEYS),
    markWhen("M1330_STAS_ULCR_PRSNT", ["00", "03"], ["M1332_NBR_STAS_ULCR", "M1334_STUS_PRBLM_STAS_ULCR"]),
    markWhen("M1340_SRGCL_WND_PRSNT", ["00", "02"], ["M1342_STUS_PRBLM_SRGCL_WND"]),
    markWhen("M2001_DRUG_RGMN_RVW", "0", ["M2003_MDCTN_FLWP"]),
    markWhen("M2001_DRUG_RGMN_RVW", "9", ["M2003_MDCTN_FLWP", "M2010_HIGH_RISK_DRUG_EDCTN"]),
  ],
  sections: [
    {
      id: "cover",
      label: "Cover",
      items: admin.coverNotices({
        title: "OASIS-E2 Start of Care (SOC) Assessment",
        pages: "1–23 of 23",
        formNote:
          "SOC Note: This Start of Care assessment is administered at the start of home health services. M0100 is always coded 01 (Start of care), TRANS_TYPE_CD = 1 (Add new record).",
      }),
    },
    {
      id: "A",
      label: "A · Admin",
      items: [
        admin.a1005(keysOf("A1005", ["A", "B", "C", "D", "E", "X", "Y"])),
        admin.a1010(keysOf("A1010", ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "X", "Y", "Z"])),
        withMaxLength(admin.a1110a("A1110A"), 15),
        admin.a1110b("A1110B"),
        admin.m0080("M0080_ASSESSOR_DISCIPLINE", { maxLength: 2 }),
        admin.m0090("M0090_INFO_COMPLETED_DT"),
        admin.m0100("M0100_ASSMT_REASON", { twoDigitCodes: true, defaultValue: "01" }),
        admin.m0102(M0102, `${M0102}_NA`),
        admin.m0104("M0104_PHYSN_RFRL_DT"),
        len2(admin.a1255("A1255")),
        admin.m1000([
          "M1000_DC_LTC_14_DA",
          "M1000_DC_SNF_14_DA",
          "M1000_DC_IPPS_14_DA",
          "M1000_DC_LTCH_14_DA",
          "M1000_DC_IRF_14_DA",
          "M1000_DC_PSYCH_14_DA",
          "M1000_DC_OTH_14_DA",
          "M1000_DC_NONE_14_DA",
        ]),
        admin.m1005("M1005_INP_DISCHARGE_DT", "M1005_INP_DSCHG_UNKNOWN"),
      ],
    },
    {
      id: "B",
      label: "B · Hearing/Vision",
      items: [len2(cog.b0200("B0200")), len2(cog.b1000("B1000")), len2(cog.b1300("B1300"))],
    },
    {
      id: "C",
      label: "C · Cognition",
      items: [
        len2(cog.c0100("C0100")),
        cog.bimsHeading(),
        len2(cog.c0200("C0200")),
        len2(cog.c0300a("C0300A")),
        len2(cog.c0300b("C0300B")),
        len2(cog.c0300c("C0300C")),
        len2(cog.c0400a("C0400A")),
        len2(cog.c0400b("C0400B")),
        len2(cog.c0400c("C0400C")),
        asText(cog.c0500("C0500"), 2),
        cog.deliriumHeading(),
        len2(cog.c1310a("C1310A")),
        { ...len2(cog.c1310b("C1310B")), options: DELIRIUM_CODES },
        { ...len2(cog.c1310c("C1310C")), options: DELIRIUM_CODES },
        { ...len2(cog.c1310d("C1310D")), options: DELIRIUM_CODES },
        len2(cog.m1700("M1700_COG_FUNCTION")),
        twoDigitCodes(cog.m1710("M1710_WHEN_CONFUSED")),
        twoDigitCodes(cog.m1720("M1720_WHEN_ANXIOUS")),
      ],
    },
    {
      id: "D",
      label: "D · Mood",
      items: [cog.d0150((letter, column) => `D0150${letter}${column}`), asText(cog.d0160("D0160"), 2), len2(cog.d0700("D0700"))],
    },
    {
      id: "E",
      label: "E · Behavior",
      items: [
        cog.m1740([
          "M1740_BD_MEM_DEFICIT",
          "M1740_BD_IMP_DECISN",
          "M1740_BD_VERBAL",
          "M1740_BD_PHYSICAL",
          "M1740_BD_SOC_INAPPRO",
          "M1740_BD_DELUSIONS",
          "M1740_BD_NONE",
        ]),
        twoDigitCodes(cog.m1745("M1745_BEH_PROB_FREQ")),
      ],
    },
    {
      id: "F",
      label: "F · Living",
      items: [fn.m1100("M1100_PTNT_LVG_STUTN"), len2(fn.m2102f("M2102_CARE_TYPE_SRC_SPRVSN"))],
    },
    {
      id: "G",
      label: "G · Functional",
      items: fn.gFunctionalItems((itemCode) => G_KEYS[itemCode]).map(twoDigitCodes),
    },
    {
      id: "GG",
      label: "GG · Abilities",
      items: [
        (() => {
          const gg0100 = fn.gg0100((letter) => `GG0100${letter}`);
          return { ...gg0100, rows: gg0100.rows.map((row) => ({ ...row, maxLength: 2 })) };
        })(),
        fn.gg0110(keysOf("GG0110", ["A", "B", "C", "D", "E", "Z"])),
        fn.ggLegend(),
        fn.gg0130((letter) => `GG0130${letter}1`, {
          label: "GG0130 — Self-Care (SOC/ROC Performance)",
          columnLabel: GG_COLUMN,
        }),
        fn.gg0170(gg0170Key, {
          label: "GG0170 — Mobility (SOC/ROC Performance)",
          columnLabel: GG_COLUMN,
          maxLengths: { Q: 2 },
        }),
      ],
    },
    {
      id: "H",
      label: "H · Bladder/Bowel",
      items: [
        twoDigitCodes(fn.m1600("M1600_UTI")),
        twoDigitCodes(fn.m1610("M1610_UR_INCONT")),
        twoDigitCodes(fn.m1620("M1620_BWL_INCONT")),
        twoDigitCodes(fn.m1630("M1630_OSTOMY")),
      ],
    },
    {
      id: "I",
      label: "I · Diagnoses",
      items: [
        {
          ...health.diagnoses([
            { icdFieldId: "M1021_PRIMARY_DIAG_ICD", severityFieldId: "M1021_PRIMARY_DIAG_SEVERITY" },
            ...[1, 2, 3, 4, 5].map((n) => ({
              icdFieldId: `M1023_OTH_DIAG${n}_ICD`,
              severityFieldId: `M1023_OTH_DIAG${n}_SEVERITY`,
            })),
          ]),
          icdMaxLength: 8,
        },
        health.m1028(["M1028_ACTV_DIAG_PVD_PAD", "M1028_ACTV_DIAG_DM", "M1028_ACTV_DIAG_NOA"]),
      ],
    },
    {
      id: "J",
      label: "J · Health Cond.",
      items: [
        health.m1033([
          "M1033_HOSP_RISK_HSTRY_FALLS",
          "M1033_HOSP_RISK_WEIGHT_LOSS",
          "M1033_HOSP_RISK_MLTPL_HOSPZTN",
          "M1033_HOSP_RISK_MLTPL_ED_VISIT",
          "M1033_HOSP_RISK_MNTL_BHV_DCLN",
          "M1033_HOSP_RISK_COMPLIANCE",
          "M1033_HOSP_RISK_5PLUS_MDCTN",
          "M1033_HOSP_RISK_CRNT_EXHSTN",
          "M1033_HOSP_RISK_OTHR_RISK",
          "M1033_HOSP_RISK_NONE_ABOVE",
        ]),
        len2(health.j0510("J0510")),
        len2(health.j0520("J0520")),
        len2(health.j0530("J0530")),
        twoDigitCodes(health.m1400("M1400_WHEN_DYSPNEIC")),
      ],
    },
    {
      id: "K",
      label: "K · Nutrition",
      items: [
        asText(health.m1060Height("M1060_HEIGHT_A"), 2),
        asText(health.m1060Weight("M1060_WEIGHT_B"), 3),
        health.k0520(keysOf("K0520", ["A", "B", "C", "D", "Z"], "1"), {
          label: "Nutritional Approaches — On Admission",
          description: "Check all of the nutritional approaches that apply on admission.",
        }),
        twoDigitCodes(health.m1870("M1870_CRNT_FEEDING")),
      ],
    },
    {
      id: "M",
      label: "M · Skin",
      items: [
        len2(skin.m1306("M1306_UNHLD_STG2_PRSR_ULCR")),
        { ...skin.m1311(M1311_KEYS), widget: W.GG_MATRIX, range: undefined },
        twoDigitCodes(skin.m1322("M1322_NBR_PRSULC_STG1")),
        twoDigitCodes(skin.m1324("M1324_STG_PRBLM_ULCER")),
        twoDigitCodes(skin.m1330("M1330_STAS_ULCR_PRSNT")),
        twoDigitCodes(skin.m1332("M1332_NBR_STAS_ULCR")),
        twoDigitCodes(skin.m1334("M1334_STUS_PRBLM_STAS_ULCR")),
        twoDigitCodes(skin.m1340("M1340_SRGCL_WND_PRSNT")),
        twoDigitCodes(skin.m1342("M1342_STUS_PRBLM_SRGCL_WND")),
      ],
    },
    {
      id: "N",
      label: "N · Medications",
      items: [
        skin.n0415((letter, column) => `N0415${letter}${column === "take" ? 1 : 2}`, "N0415Z1"),
        len2(skin.m2001("M2001_DRUG_RGMN_RVW")),
        len2(skin.m2003("M2003_MDCTN_FLWP")),
        twoDigitCodes(skin.m2010("M2010_HIGH_RISK_DRUG_EDCTN")),
        twoDigitCodes(skin.m2020("M2020_CRNT_MGMT_ORAL_MDCTN")),
        twoDigitCodes(skin.m2030("M2030_CRNT_MGMT_INJCTN_MDCTN")),
      ],
    },
    {
      id: "O",
      label: "O · Special Tx",
      items: [
        skin.o0110((code) => `O0110${code}A`, {
          label: "Special Treatments, Procedures, and Programs (SOC/ROC)",
          description: "Check all of the following treatments, procedures, and programs that apply on admission.",
        }),
        { itemCode: null, label: "Send for Review", widget: W.EMAIL_ACTION },
      ],
    },
  ],
};

export default socSchema;
