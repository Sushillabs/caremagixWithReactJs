import { useFormContext } from "react-hook-form";

// Hidden field backing a custom widget (§1.10) — e.g. ROC's diagnosis-severity value,
// which BUTTON_GROUP already writes directly, so this is only needed when a schema
// entry stores computed/internal state with no visible control of its own.
export default function HiddenField({ field }) {
  const { register } = useFormContext();
  return <input type="hidden" {...register(field.fieldId)} />;
}
