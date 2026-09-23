import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Check } from "lucide-react";
import FieldShell from "./FieldShell";

export default function CheckboxGroupField({ field }) {
  const { control } = useFormContext();
  const options = field.checkboxOptions ?? [];
  const values = useWatch({ control, name: options.map((o) => o.fieldId) });
  const selectedCount = (values ?? []).filter(Boolean).length;

  const layout = field.layout ?? "list";
  const gridClass =
    layout === "two-col" ? "grid grid-cols-1 gap-2 sm:grid-cols-2"
    : layout === "grid-3" ? "grid grid-cols-1 gap-2 sm:grid-cols-3"
    : "flex flex-col gap-2";

  const count =
    selectedCount > 0 ? (
      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
        {selectedCount} selected
      </span>
    ) : null;

  return (
    <FieldShell field={field} headerRight={count}>
      <div className={gridClass}>
        {options.map((opt) => (
          <Controller
            key={opt.fieldId}
            name={opt.fieldId}
            control={control}
            defaultValue={false}
            render={({ field: { value, onChange } }) => (
              <button
                type="button"
                onClick={() => onChange(!value)}
                className={
                  "flex min-h-[46px] w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors " +
                  (value
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50")
                }
              >
                {value ? (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-600">
                    <Check size={11} strokeWidth={3} className="text-white" />
                  </span>
                ) : (
                  <span className="h-4 w-4 shrink-0 rounded border-2 border-gray-300" />
                )}
                <span className={"text-xs " + (value ? "text-emerald-900" : "text-gray-600")}>{opt.label}</span>
              </button>
            )}
          />
        ))}
      </div>
    </FieldShell>
  );
}
