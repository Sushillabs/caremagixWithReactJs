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
      render={({ field: { value, onChange } }) => {
        const codeBox = (
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Code</span>
            <input
              type="text"
              name={field.fieldId}
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
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 pr-3" />
                    {colGroups.map((col) => (
                      <th key={col} className="w-24 px-2 py-2 text-center text-[11px] font-semibold text-gray-600">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rowGroups.map((row) => (
                    <tr key={row}>
                      <th className="py-2 pr-3 text-[13px] font-normal text-gray-700">{row}</th>
                      {colGroups.map((col) => {
                        const opt = field.options.find((o) => o.rowGroup === row && o.colGroup === col);
                        if (!opt) return <td key={col} />;
                        const selected = value === opt.value;
                        return (
                          <td key={col} className="px-2 py-2 text-center">
                            <button
                              type="button"
                              aria-pressed={selected}
                              onClick={() => onChange(opt.value)}
                              className={
                                "h-9 w-12 rounded-lg border font-mono text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 " +
                                (selected
                                  ? "border-emerald-600 bg-emerald-600 font-semibold text-white"
                                  : "border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50")
                              }
                            >
                              {opt.value}
                            </button>
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
      }}
    />
  );
}
