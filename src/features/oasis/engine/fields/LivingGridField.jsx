import { Controller, useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

// M1100 row×column radio grid (§b) — ROC-exclusive. All options share ONE fieldId
// (single-select), laid out by `rowGroup`/`colGroup` instead of a flat list, per §G
// (ROC's grid shape is load-bearing and kept rather than normalized to SOC's flat list).
export default function LivingGridField({ field }) {
  const { control } = useFormContext();
  const rowGroups = [...new Set(field.options?.map((o) => o.rowGroup))];
  const colGroups = [...new Set(field.options?.map((o) => o.colGroup))];

  return (
    <Controller
      name={field.fieldId}
      control={control}
      defaultValue=""
      render={({ field: { value, onChange } }) => (
        <FieldShell field={field}>
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse">
              <thead>
                <tr>
                  <th className="w-32" />
                  {colGroups.map((col) => (
                    <th key={col} className="px-2 py-1 font-medium text-gray-600 text-center">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowGroups.map((row) => (
                  <tr key={row} className="border-t border-gray-100">
                    <th className="text-left py-1.5 pr-3 font-medium text-gray-600">{row}</th>
                    {colGroups.map((col) => {
                      const opt = field.options.find((o) => o.rowGroup === row && o.colGroup === col);
                      if (!opt) return <td key={col} />;
                      return (
                        <td key={col} className="text-center px-2">
                          <label className="flex flex-col items-center gap-0.5 cursor-pointer">
                            <input
                              type="radio"
                              name={field.fieldId}
                              checked={value === opt.value}
                              onChange={() => onChange(opt.value)}
                            />
                            <span className="text-xs text-gray-400">{opt.value}</span>
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FieldShell>
      )}
    />
  );
}
