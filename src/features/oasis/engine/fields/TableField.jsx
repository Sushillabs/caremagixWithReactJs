import { Controller, useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import { FIELD_WIDGETS } from "../schema";
import FieldShell from "./FieldShell";

function CodeCell({ control, fieldId, maxLength }) {
  return (
    <Controller
      name={fieldId}
      control={control}
      defaultValue=""
      render={({ field: { value, onChange } }) => (
        <input
          type="text"
          name={fieldId}
          maxLength={maxLength ?? 2}
          placeholder="—"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={
            "h-10 w-14 rounded-lg border text-center text-sm font-semibold placeholder:font-normal placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 " +
            (value ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-300 text-gray-800")
          }
        />
      )}
    />
  );
}

function CheckCell({ control, fieldId, label }) {
  return (
    <Controller
      name={fieldId}
      control={control}
      defaultValue={false}
      render={({ field: { value, onChange } }) => (
        <button
          type="button"
          name={fieldId}
          aria-pressed={!!value}
          aria-label={label}
          onClick={() => onChange(!value)}
          className={
            "inline-flex h-6 w-6 items-center justify-center rounded border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 " +
            (value ? "border-emerald-600 bg-emerald-600" : "border-gray-300 hover:border-gray-400")
          }
        >
          {value && <Check size={14} strokeWidth={3} className="text-white" />}
        </button>
      )}
    />
  );
}

export default function TableField({ field }) {
  const { control } = useFormContext();
  const columns = field.columns ?? [];
  const checkbox = field.widget === FIELD_WIDGETS.CHECKBOX_TABLE;

  return (
    <FieldShell field={field}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 pr-3 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {field.rowHeader}
              </th>
              {columns.map((col) => (
                <th key={col.label} className="w-28 px-2 py-2 text-center text-[11px] font-semibold text-gray-600">
                  {col.label}
                  {col.hint && <span className="block text-[10px] font-normal text-gray-400">{col.hint}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {field.tableRows?.map((row) => (
              <tr key={row.label}>
                <td className="py-2 pr-3 text-[13px] text-gray-700">{row.label}</td>
                {columns.map((col, i) => {
                  const fieldId = row.fieldIds[i];
                  return (
                    <td key={col.label} className="px-2 py-2 text-center">
                      {fieldId &&
                        (checkbox ? (
                          <CheckCell control={control} fieldId={fieldId} label={`${row.label} — ${col.label}`} />
                        ) : (
                          <CodeCell control={control} fieldId={fieldId} maxLength={col.maxLength} />
                        ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FieldShell>
  );
}
