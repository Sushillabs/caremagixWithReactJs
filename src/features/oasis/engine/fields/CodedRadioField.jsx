import { Controller, useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

// Code-box + synced radio list (§1.1) — the single most common OASIS pattern. Both
// controls represent ONE value on ONE field id; selecting a radio or typing a code
// writes the same underlying value, matching legacy's two-way sync.
export default function CodedRadioField({ field }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={field.fieldId}
      control={control}
      defaultValue=""
      render={({ field: { value, onChange } }) => (
        <FieldShell field={field}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wide text-gray-500">Enter code</span>
            <input
              type="text"
              maxLength={field.maxLength ?? 2}
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              className="w-14 border rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={field.fieldId}
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                  className="mt-1"
                />
                <span>
                  <span className="font-mono mr-1">{opt.value}.</span>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </FieldShell>
      )}
    />
  );
}
