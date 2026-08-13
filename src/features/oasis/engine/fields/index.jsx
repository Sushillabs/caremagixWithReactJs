import { FIELD_WIDGETS } from "../schema";
import CodedRadioField from "./CodedRadioField";
import CheckboxGroupField from "./CheckboxGroupField";
import SplitDateField from "./SplitDateField";
import TextField from "./TextField";
import NumericField from "./NumericField";
import CountGridField from "./CountGridField";
import TextUnknownField from "./TextUnknownField";
import HiddenField from "./HiddenField";
import EmailActionField from "./EmailActionField";
import FileImportField from "./FileImportField";
import ButtonGroupField from "./ButtonGroupField";
import GgMatrixField from "./GgMatrixField";
import LivingGridField from "./LivingGridField";
import AiAssistTriggerField from "./AiAssistTriggerField";

// One component per widget kind (§(a) of the field inventory) — the field registry
// the schema-driven engine dispatches against. Adding a 14th widget kind means adding
// one entry here, nothing else in the engine changes.
export const FIELD_COMPONENTS = {
  [FIELD_WIDGETS.CODED_RADIO]: CodedRadioField,
  [FIELD_WIDGETS.CHECKBOX_GROUP]: CheckboxGroupField,
  [FIELD_WIDGETS.SPLIT_DATE]: SplitDateField,
  [FIELD_WIDGETS.TEXT]: TextField,
  [FIELD_WIDGETS.NUMERIC]: NumericField,
  [FIELD_WIDGETS.COUNT_GRID]: CountGridField,
  [FIELD_WIDGETS.TEXT_UNKNOWN]: TextUnknownField,
  [FIELD_WIDGETS.HIDDEN]: HiddenField,
  [FIELD_WIDGETS.EMAIL_ACTION]: EmailActionField,
  [FIELD_WIDGETS.FILE_IMPORT]: FileImportField,
  [FIELD_WIDGETS.BUTTON_GROUP]: ButtonGroupField,
  [FIELD_WIDGETS.GG_MATRIX]: GgMatrixField,
  [FIELD_WIDGETS.LIVING_GRID]: LivingGridField,
  [FIELD_WIDGETS.AI_ASSIST_TRIGGER]: AiAssistTriggerField,
};

// Dispatcher every section renderer uses: <OasisField field={fieldDef} />.
// Visibility from skipWhen is NOT handled here — that's the skip-logic evaluator
// (Phase 0.3), which decides whether to render this component at all.
export default function OasisField({ field, ...actionProps }) {
  const Widget = FIELD_COMPONENTS[field.widget];
  if (!Widget) {
    return (
      <div className="py-2 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-3">
        Unknown widget "{field.widget}" for {field.itemCode ?? field.fieldId} — schema authoring error.
      </div>
    );
  }
  return <Widget field={field} {...actionProps} />;
}
