import { Controller, useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

export default function RadioTableField({ field }) {
  const { control } = useFormContext();
  const options = field.options ?? [];

  return (
    <FieldShell field={field}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 pr-3 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {field.rowHeader}
              </th>
              {options.map((opt) => (
                <th key={opt.value} className="w-20 px-2 py-2 text-center text-[11px] font-semibold text-gray-600">
                  {opt.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {field.radioRows?.map((row) => (
              <Controller
                key={row.fieldId}
                name={row.fieldId}
                control={control}
                defaultValue=""
                render={({ field: { value, onChange } }) => (
                  <tr>
                    <td className="py-2.5 pr-3">
                      <p className="text-[13px] font-medium text-gray-700">{row.label}</p>
                      {row.description && <p className="mt-0.5 text-[11px] text-gray-400">{row.description}</p>}
                    </td>
                    {options.map((opt, i) => {
                      const selected = value === opt.value;
                      return (
                        <td key={opt.value} className="px-2 py-2.5 text-center">
                          <button
                            type="button"
                            name={i === 0 ? row.fieldId : undefined}
                            aria-pressed={selected}
                            aria-label={`${row.label} — ${opt.label}`}
                            onClick={() => onChange(opt.value)}
                            className={
                              "inline-flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 " +
                              (selected ? "border-emerald-600" : "border-gray-300 hover:border-gray-400")
                            }
                          >
                            {selected && <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                )}
              />
            ))}
          </tbody>
        </table>
      </div>
    </FieldShell>
  );
}
