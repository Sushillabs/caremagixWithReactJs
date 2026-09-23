import { useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

// type=number with min/max (§1.5) — rare: BIMS score, PHQ score, height/weight,
// ROC's M1311 stage counts. Never used for M-item/GG codes (those stay text — §1.5 note).
export default function NumericField({ field }) {
  const { register } = useFormContext();
  return (
    <FieldShell field={field}>
      <input
        type="number"
        min={field.range?.min}
        max={field.range?.max}
        {...register(field.fieldId)}
        className="w-24 border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </FieldShell>
  );
}
