import { useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

// type=number with min/max (§1.5) — rare: BIMS score, PHQ score, height/weight,
// ROC's M1311 stage counts. Never used for M-item/GG codes (those stay text — §1.5 note).
export default function NumericField({ field }) {
  const { register } = useFormContext();
  return (
    <FieldShell field={field}>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={field.range?.min}
          max={field.range?.max}
          placeholder={field.placeholder}
          {...register(field.fieldId)}
          className="h-10 w-24 rounded-lg border border-gray-300 px-3 text-center text-sm font-semibold text-gray-800 placeholder:font-normal placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {field.unit && <span className="text-xs text-gray-500">{field.unit}</span>}
      </div>
    </FieldShell>
  );
}
