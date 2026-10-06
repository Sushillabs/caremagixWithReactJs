import { FIELD_WIDGETS } from "../engine/schema";
import { keysOf } from "./shared/questions/helpers";
import * as admin from "./shared/questions/admin";
import * as cog from "./shared/questions/cognitionMood";
import * as fn from "./shared/questions/function";
import * as health from "./shared/questions/health";
import * as skin from "./shared/questions/skinMeds";
import * as td from "./shared/questions/transferDischarge";
import { markWhen, GG_NOT_ATTEMPTED } from "./shared/skipRules";

// Field keys and max lengths are legacy oasis-dc.html's (plus the blocks oasis-core.js builds
// for it), unchanged. DC runs on the core engine, like FU and ROC.
const gg0170Key = (letter) => (letter === "Q" ? "GG0170Q" : `GG0170_${letter}`);
const AE = ["A", "B", "C", "D", "E"];
const M2310_KEYS = ["M2310_1", "M2310_10", "M2310_19", "M2310_UK"];
const A2122_KEYS = keysOf("A2122_", AE);
const A2124_KEYS = keysOf("A2124_", AE);
const M1311_KEYS = keysOf("M1311_", ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2", "E1", "E2", "F1", "F2"]);

export const dcSchema = {
  formKey: "OASIS-E2-DC",
  formType: "DC",
  title: "Discharge Assessment",
  // Same order as legacy applySkipPatternsToRaw_DC. Its two "else if" branches are plain rules
  // here: once the first rule marks A2121 / A2123 with "^", the second can no longer see "0".
  // M1332 is not a DC field, but legacy still writes it, so it is marked here too.
  skipMarks: [
    markWhen("M2301", ["0", "UK"], M2310_KEYS),
    markWhen("M2420", ["1", "4", "UK"], ["A2121", ...A2122_KEYS]),
    markWhen("A2121", "0", A2122_KEYS),
    markWhen("M2420", ["2", "3"], ["A2123", ...A2124_KEYS]),
    markWhen("A2123", "0", A2124_KEYS),
    markWhen("C0100", "0", ["C0200", "C0300A", "C0300B", "C0300C", "C0400A", "C0400B", "C0400C", "C0500"]),
    markWhen("GG0170_I", GG_NOT_ATTEMPTED, ["GG0170_J", "GG0170_K", "GG0170_L"]),
    markWhen("GG0170_M", GG_NOT_ATTEMPTED, ["GG0170_N", "GG0170_O"]),
    markWhen("GG0170_N", GG_NOT_ATTEMPTED, ["GG0170_O"]),
    markWhen("GG0170Q", "0", ["GG0170_R", "GG0170_RR1", "GG0170_S", "GG0170_SS1"]),
    markWhen("J0510", "0", ["J0520", "J0530"]),
    markWhen("J1800", "0", ["J1900A", "J1900B", "J1900C"]),
    markWhen("M1306", "0", M1311_KEYS),
    markWhen("M1330", ["0", "3"], ["M1332", "M1334"]),
    markWhen("M1340", ["0", "2"], ["M1342"]),
    markWhen("M1041", "0", ["M1046"]),
  ],
  sections: [
    {
      id: "cover",
      label: "Cover",
      items: admin.coverNotices({ title: "OASIS-E2 Discharge (DC) Assessment", pages: "1–20 of 20" }),
    },
    {
      id: "A",
      label: "A · Admin",
      items: [
        admin.m0080("M0080", { maxLength: 2 }),
        admin.m0090("M0090"),
        admin.m0100("M0100"),
        admin.m0906("M0906"),
        td.m2301("M2301", { maxLength: 2 }),
        td.m2310(M2310_KEYS),
        td.m2410("M2410", { withNA: true, maxLength: 2 }),
        td.m2420("M2420", { maxLength: 2 }),
        td.a2121("A2121", { maxLength: 2 }),
        td.a2122(A2122_KEYS),
        td.a2123("A2123", { maxLength: 2 }),
        td.a2124(A2124_KEYS),
      ],
    },
    {
      id: "B",
      label: "B · Health Lit.",
      items: [cog.b1300("B1300", { maxLength: 2 })],
    },
    {
      id: "C",
      label: "C · Cognition",
      items: [
        cog.c0100("C0100", { maxLength: 2 }),
        cog.bimsHeading(),
        cog.c0200("C0200", { maxLength: 2 }),
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
      label: "F · Assistance",
      items: ["a", "c", "d", "f"].map((letter) => fn.m2102(letter, `M2102${letter}`)),
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
        fn.ggLegend(),
        fn.gg0130((letter) => `GG0130_${letter}`, {
          label: "GG0130 — Self-Care (Discharge Performance)",
          columnLabel: "Discharge Code (01–06, 07, 09, 10, 88)",
        }),
        fn.gg0170(gg0170Key, {
          label: "GG0170 — Mobility (Discharge Performance)",
          columnLabel: "Discharge Code (01–06, 07, 09, 10, 88)",
          maxLengths: { RR1: 1, SS1: 1 },
        }),
      ],
    },
    {
      id: "H",
      label: "H · Bladder/Bowel",
      items: [fn.m1600("M1600", { withUnknown: false }), fn.m1620("M1620", { withUnknown: false })],
    },
    {
      id: "J",
      label: "J · Health Cond.",
      items: [
        health.j0510("J0510"),
        health.j0520("J0520"),
        health.j0530("J0530"),
        health.j1800("J1800"),
        health.j1900((letter) => `J1900${letter}`),
        health.m1400("M1400"),
      ],
    },
    // {
    //   id: "K",
    //   label: "K · Nutrition",
    //   items: [
    //     health.k0520Columns((letter, column) => `K0520_${letter}_${column === 0 ? "7" : "dc"}`, {
    //       label: "Nutritional Approaches",
    //       description: "Check all nutritional approaches received. Column 4 = Last 7 days. Column 5 = At discharge.",
    //       columns: ["4. Last 7 Days", "5. At Discharge"],
    //     }),
    //     health.m1870("M1870"),
    //   ],
    // },
    // {
    //   id: "M",
    //   label: "M · Skin",
    //   items: [
    //     skin.m1306("M1306"),
    //     skin.m1307("M1307"),
    //     skin.m1307Date("M1307"),
    //     skin.m1311WithSocRoc(M1311_KEYS),
    //     skin.m1324("M1324"),
    //     skin.m1330("M1330"),
    //     skin.m1334("M1334"),
    //     skin.m1340("M1340"),
    //     skin.m1342("M1342"),
    //   ],
    // },
    // {
    //   id: "N",
    //   label: "N · Medications",
    //   items: [
    //     skin.n0415((letter, column) => `N0415_${letter}_${column}`, "N0415_Z"),
    //     skin.m2005("M2005"),
    //     skin.m2020("M2020"),
    //   ],
    // },
    // {
    //   id: "O",
    //   label: "O · Special Tx",
    //   items: [
    //     skin.o0110((code) => `O0110_${code}`, {
    //       label: "Special Treatments, Procedures, and Programs",
    //       description: "Check all of the following treatments, procedures, and programs that apply on discharge.",
    //     }),
    //     td.m1041("M1041"),
    //     td.m1046("M1046"),
    //   ],
    // },
    // {
    //   id: "Q",
    //   label: "Q · Interventions",
    //   items: [
    //     td.m2401(keysOf("M2401_", ["b", "c", "d", "e", "f"])),
    //     { itemCode: null, label: "Send for Review", widget: FIELD_WIDGETS.EMAIL_ACTION },
    //   ],
    // },
  ],
};

export default dcSchema;
