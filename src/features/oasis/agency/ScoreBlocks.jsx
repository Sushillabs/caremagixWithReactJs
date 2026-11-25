import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

function Suggestion({ suggest, value, onUse }) {
  const cmsValues = useWatch({ name: suggest.fields });
  const suggested = suggest.compute(cmsValues);
  if (suggested === null || suggested === undefined) return null;

  return (
    <span className="flex flex-wrap items-center gap-1.5 text-[11px] text-blue-700">
      Suggested: {suggested} (from {suggest.source})
      {value !== suggested && (
        <button
          type="button"
          onClick={() => onUse(suggested)}
          className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-medium hover:bg-blue-100"
        >
          Use
        </button>
      )}
    </span>
  );
}

export function ScoreRows({ base, rows }) {
  const { control } = useFormContext();
  return (
    <div className="divide-y divide-gray-100">
      {rows.map((row) => (
        <Controller
          key={row.key}
          name={`${base}.${row.key}`}
          control={control}
          defaultValue=""
          render={({ field: { value, onChange } }) => {
            const selected = row.options.find((option) => option.value === value);
            return (
              <div className="py-2.5">
                <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[13px] font-medium text-gray-700">{row.label}</span>
                  {row.suggest && <Suggestion suggest={row.suggest} value={value} onUse={onChange} />}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {row.options.map((option) => {
                    const isSelected = value === option.value;
                    return (
                      <button
                        key={option.value + option.label}
                        type="button"
                        aria-pressed={isSelected}
                        aria-label={`${row.label} — ${option.value} ${option.label}`}
                        onClick={() => onChange(isSelected ? "" : option.value)}
                        className={
                          "min-h-8 rounded-md border px-2.5 py-1 text-left text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 " +
                          (isSelected
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50")
                        }
                      >
                        <span className="font-semibold">{option.value}</span> · {option.label}
                      </button>
                    );
                  })}
                </div>
                {selected?.description && <p className="mt-1.5 text-[11px] text-gray-500">{selected.description}</p>}
              </div>
            );
          }}
        />
      ))}
    </div>
  );
}

const TONES = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-700",
  gray: "border-gray-200 bg-gray-50 text-gray-600",
};

export function TotalBlock({ base, block }) {
  const { setValue } = useFormContext();
  const values = useWatch({ name: base });
  const total = block.compute(values ?? {});
  const level = total === null ? null : block.level(total);

  useEffect(() => {
    setValue(`${base}.total`, total === null ? "" : String(total));
    setValue(`${base}.risk_level`, level?.text ?? "");
  }, [base, total, level?.text, setValue]);

  return (
    <div className={"flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border px-3 py-2 " + TONES[level?.tone ?? "gray"]}>
      <span className="text-sm font-semibold">Total: {total === null ? "—" : total}</span>
      <span className="text-xs">{level ? level.text : block.incompleteText}</span>
      {level?.note && <span className="basis-full text-xs">{level.note}</span>}
    </div>
  );
}
