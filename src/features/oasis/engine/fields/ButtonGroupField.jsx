import { Controller, useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

// Custom clickable button-group single-select (§1.15) — e.g. ROC's diagnosis severity
// (0-4 as buttons, not radios). Same enum semantics as CodedRadioField, different
// legacy widget shape preserved per §G (ROC's rendering is load-bearing, kept as-is).
export default function ButtonGroupField({ field }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={field.fieldId}
      control={control}
      defaultValue=""
      render={({ field: { value, onChange } }) => (
        <FieldShell field={field}>
          <div className="flex gap-1.5">
            {field.options?.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                aria-pressed={value === opt.value}
                className={
                  "w-8 h-8 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 " +
                  (value === opt.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400")
                }
                title={opt.label}
              >
                {opt.value}
              </button>
            ))}
          </div>
        </FieldShell>
      )}
    />
  );
}
