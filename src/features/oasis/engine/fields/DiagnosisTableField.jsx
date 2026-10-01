import { Controller, useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

const DEFAULT_SEVERITIES = ["0", "1", "2", "3", "4"];

export default function DiagnosisTableField({ field }) {
  const { control, register } = useFormContext();
  const severities = field.severityOptions ?? DEFAULT_SEVERITIES;

  return (
    <FieldShell field={field}>
      <div className="flex flex-col divide-y divide-gray-100">
        {field.diagnosisRows?.map((row) => (
          <div key={row.icdFieldId} className="flex flex-wrap items-end gap-x-6 gap-y-2 py-3">
            <div className="min-w-[220px] flex-1">
              <p className="mb-1 text-[11px] text-gray-500">
                {row.label}
                {row.note && <span className="italic text-gray-400"> — {row.note}</span>}
              </p>
              <input
                type="text"
                placeholder="ICD-10-CM code"
                {...register(row.icdFieldId)}
                className="h-10 w-full max-w-xs rounded-lg border border-gray-300 px-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <Controller
              name={row.severityFieldId}
              control={control}
              defaultValue=""
              render={({ field: { value, onChange } }) => (
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    {field.severityLabel ?? "Severity"}
                  </p>
                  <div className="flex gap-1.5">
                    {severities.map((severity, i) => (
                      <button
                        key={severity}
                        type="button"
                        name={i === 0 ? row.severityFieldId : undefined}
                        aria-pressed={value === severity}
                        onClick={() => onChange(severity)}
                        className={
                          "h-10 w-10 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 " +
                          (value === severity
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50")
                        }
                      >
                        {severity}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />
          </div>
        ))}
      </div>
    </FieldShell>
  );
}
