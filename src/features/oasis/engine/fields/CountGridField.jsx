import { useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

// Fixed-row label+number grid (§1.6) — e.g. M1311 pressure-ulcer stage counts.
// Each row is its own field id; this is a fixed slot set, not a repeating group (§c/§G).
export default function CountGridField({ field }) {
  const { register } = useFormContext();
  return (
    <FieldShell field={field}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 max-w-xl">
        {field.rows?.map((row) => (
          <div key={row.fieldId} className="flex items-center gap-2">
            <label className="flex-1 text-sm">{row.label}</label>
            <input
              type="text"
              maxLength={2}
              placeholder="#"
              {...register(row.fieldId)}
              className="w-16 border rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </FieldShell>
  );
}
