import { Controller, useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import FieldShell from "./FieldShell";

export default function CodedRadioField({ field }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={field.fieldId}
      control={control}
      defaultValue=""
      render={({ field: { value, onChange } }) => {
        const codeBox = (
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Code</span>
            <input
              type="text"
              maxLength={field.maxLength ?? 2}
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              className={
                "h-9 w-14 rounded-md border text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 " +
                (value ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-300 text-gray-800")
              }
            />
          </div>
        );

        return (
          <FieldShell field={field} headerRight={codeBox}>
            <div className="flex flex-col gap-2">
              {field.options?.map((opt) => {
                const selected = value === opt.value;
                return (
                  <div key={opt.value}>
                    {opt.groupLabel && (
                      <p className="mb-1.5 mt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        {opt.groupLabel}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => onChange(opt.value)}
                      className={
                        "flex w-full min-h-[46px] items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors " +
                        (selected
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50")
                      }
                    >
                      {selected ? (
                        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-600">
                          <Check size={12} strokeWidth={3} className="text-white" />
                        </span>
                      ) : (
                        <span className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-gray-300" />
                      )}
                      <span
                        className={
                          "shrink-0 font-mono text-xs " + (selected ? "font-semibold text-emerald-700" : "text-gray-400")
                        }
                      >
                        {opt.value}
                      </span>
                      <span className={"text-[13px] " + (selected ? "text-emerald-900" : "text-gray-600")}>
                        {opt.label}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </FieldShell>
        );
      }}
    />
  );
}
