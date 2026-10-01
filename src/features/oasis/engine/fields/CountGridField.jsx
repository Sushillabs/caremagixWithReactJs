import { useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

// Fixed-row label+number grid (§1.6) — e.g. M1311 pressure-ulcer stage counts.
// Each row is its own field id; this is a fixed slot set, not a repeating group (§c/§G).
export default function CountGridField({ field }) {
  const { register } = useFormContext();
  return (
    <FieldShell field={field}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {field.rows?.map((row) => (
          <label key={row.fieldId} className="flex min-h-[46px] items-center gap-3">
            <span className="flex-1 text-[13px] text-gray-700">{row.label}</span>
            <input
              type="number"
              min={field.range?.min ?? 0}
              max={field.range?.max}
              placeholder="0"
              {...register(row.fieldId)}
              className="h-10 w-16 shrink-0 rounded-lg border border-gray-300 text-center text-sm font-semibold text-gray-800 placeholder:font-normal placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
        ))}
      </div>
    </FieldShell>
  );
}
