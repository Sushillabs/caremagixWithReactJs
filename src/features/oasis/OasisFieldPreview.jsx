import { FormProvider, useForm } from "react-hook-form";
import OasisField from "./engine/fields";
import { FIELD_WIDGETS } from "./engine/schema";
import { filterVisibleFields } from "./engine/skipLogic";

// Temporary smoke-test page for Phase 0's field registry — NOT a real OASIS form
// (no real schema, no save/load yet). Exercises one instance of each widget kind,
// plus one real legacy skip rule (C0100='0' -> skip BIMS), with real OASIS field
// ids/labels so the registry can be eyeballed before Phase 1 wires up the actual FU
// form. Delete once Phase 1 has a real page to look at.

const demoFields = [
  {
    itemCode: "M1700", fieldId: "M1700", label: "Cognitive Functioning",
    widget: FIELD_WIDGETS.CODED_RADIO, maxLength: 1,
    options: [
      { value: "0", label: "Alert/oriented, able to focus" },
      { value: "1", label: "Requires prompting" },
      { value: "2", label: "Requires assistance and direction" },
      { value: "3", label: "Totally dependent due to disturbances" },
    ],
  },
  {
    itemCode: "A1010", label: "Race (check all that apply)",
    widget: FIELD_WIDGETS.CHECKBOX_GROUP,
    checkboxOptions: [
      { fieldId: "A1010A", itemCode: "A1010A", label: "White" },
      { fieldId: "A1010B", itemCode: "A1010B", label: "Black or African American" },
      { fieldId: "A1010C", itemCode: "A1010C", label: "American Indian or Alaska Native" },
    ],
  },
  {
    itemCode: "M0090", fieldId: "M0090", label: "Date Assessment Completed",
    widget: FIELD_WIDGETS.SPLIT_DATE,
  },
  {
    itemCode: "M0018", fieldId: "M0018_PHYSICIAN_ID", label: "Attending Physician NPI",
    widget: FIELD_WIDGETS.TEXT_UNKNOWN, maxLength: 10,
    pairedField: { fieldId: "M0018_PHYSICIAN_UK", label: "UK — Unknown", widget: "checkbox" },
  },
  {
    itemCode: "M1311", label: "Current Number of Unhealed Pressure Ulcers by Stage",
    widget: FIELD_WIDGETS.COUNT_GRID,
    rows: [
      { fieldId: "M1311_NBR_PRSULC_STG2_A1", itemCode: "M1311A1", label: "A1. Stage 2" },
      { fieldId: "M1311_NBR_PRSULC_STG3_B1", itemCode: "M1311B1", label: "B1. Stage 3" },
    ],
  },
  {
    itemCode: "GG0130", label: "Self-Care", widget: FIELD_WIDGETS.GG_MATRIX,
    columnLabel: "SOC Code",
    rows: [
      { fieldId: "GG0130A1", itemCode: "GG0130A1", label: "A. Eating" },
      { fieldId: "GG0130B1", itemCode: "GG0130B1", label: "B. Oral Hygiene" },
      { fieldId: "GG0130C1", itemCode: "GG0130C1", label: "C. Toileting Hygiene" },
    ],
  },
  {
    itemCode: "M1021_A_sev", fieldId: "M1021_A_sev", label: "Primary Diagnosis Severity",
    widget: FIELD_WIDGETS.BUTTON_GROUP,
    options: [0, 1, 2, 3, 4].map((n) => ({ value: String(n), label: `Severity ${n}` })),
  },
  {
    itemCode: "M1100", fieldId: "M1100", label: "Patient Living Situation",
    widget: FIELD_WIDGETS.LIVING_GRID,
    options: [
      { value: "01", label: "Lives alone / around-the-clock", rowGroup: "Lives alone", colGroup: "Around-the-clock" },
      { value: "02", label: "Lives alone / regular daytime", rowGroup: "Lives alone", colGroup: "Regular daytime" },
      { value: "04", label: "Lives with others / around-the-clock", rowGroup: "Lives with others", colGroup: "Around-the-clock" },
      { value: "05", label: "Lives with others / regular daytime", rowGroup: "Lives with others", colGroup: "Regular daytime" },
    ],
  },
  {
    itemCode: "C0100", fieldId: "C0100", label: "Should Brief Interview for Mental Status (BIMS) be Conducted?",
    widget: FIELD_WIDGETS.CODED_RADIO, maxLength: 1,
    options: [
      { value: "0", label: "No (patient rarely/never understood)" },
      { value: "1", label: "Yes" },
    ],
  },
  {
    itemCode: "C0500", fieldId: "C0500", label: "BIMS Summary Score",
    widget: FIELD_WIDGETS.NUMERIC, range: { min: 0, max: 99 },
    skipWhen: { when: (answers) => answers.C0100 === "0", note: "C0100 = 0 (No) → skip BIMS score" },
  },
  {
    itemCode: "A1110A", fieldId: "A1110A", label: "Preferred Language",
    widget: FIELD_WIDGETS.TEXT, maxLength: 15,
  },
  {
    itemCode: null, label: "Get ICD Recommendations",
    widget: FIELD_WIDGETS.AI_ASSIST_TRIGGER,
  },
];

export default function OasisFieldPreview() {
  const methods = useForm();
  const values = methods.watch();

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-lg font-semibold mb-1">OASIS Field Registry — Preview</h1>
        <p className="text-sm text-gray-500 mb-4">
          One instance of each widget kind, wired to react-hook-form. Temporary Phase 0 smoke test — not a real form.
        </p>
        <FormProvider {...methods}>
          <form className="divide-y">
            {demoFields.map((field) => (
              <OasisField key={field.fieldId ?? field.itemCode ?? field.label} field={field} />
            ))}
          </form>
        </FormProvider>
      </div>

      <div className="bg-gray-900 text-gray-100 rounded-2xl p-4 h-fit sticky top-6">
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Live form state</p>
        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{JSON.stringify(values, null, 2)}</pre>
      </div>
    </div>
  );
}
