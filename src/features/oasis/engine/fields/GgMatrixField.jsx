import { Controller, useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

export default function GgMatrixField({ field }) {
  const { control } = useFormContext();

  return (
    <FieldShell field={field}>
      <div className="flex flex-col divide-y divide-gray-100">
        {field.rows?.map((row) => (
          <Controller
            key={row.fieldId}
            name={row.fieldId}
            control={control}
            defaultValue=""
            render={({ field: { value, onChange } }) => (
              <div className="flex min-h-[46px] items-center gap-3 py-2">
                <span className="flex-1 text-[13px] text-gray-700">{row.label}</span>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="—"
                  value={value ?? ""}
                  onChange={(e) => onChange(e.target.value)}
                  className={
                    "h-10 w-14 shrink-0 rounded-lg border text-center text-sm font-semibold placeholder:font-normal placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 " +
                    (value ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-300 text-gray-800")
                  }
                />
              </div>
            )}
          />
        ))}
      </div>
    </FieldShell>
  );
}
