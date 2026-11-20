import { Controller, useFormContext } from "react-hook-form";

const inputCls =
  "w-full min-w-0 rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-700 focus:border-emerald-500 focus:outline-none";

function AnswerButtons({ name, label }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field: { value, onChange } }) => (
        <div className="flex shrink-0 gap-1.5">
          {[
            ["yes", "Yes"],
            ["no", "No"],
          ].map(([option, text]) => {
            const selected = value === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                aria-label={`${label} — ${text}`}
                onClick={() => onChange(selected ? "" : option)}
                className={
                  "h-8 w-12 rounded-md border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 " +
                  (selected
                    ? option === "yes"
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-gray-600 bg-gray-600 text-white"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50")
                }
              >
                {text}
              </button>
            );
          })}
        </div>
      )}
    />
  );
}

function SideChecks({ name }) {
  const { register } = useFormContext();
  return (
    <span className="flex items-center gap-3 text-xs text-gray-600">
      <label className="flex items-center gap-1">
        <input type="checkbox" {...register(`${name}.left`)} className="h-4 w-4 accent-emerald-600" /> L
      </label>
      <label className="flex items-center gap-1">
        <input type="checkbox" {...register(`${name}.right`)} className="h-4 w-4 accent-emerald-600" /> R
      </label>
    </span>
  );
}

export default function YesNoDateRows({ base, rows }) {
  const { register } = useFormContext();

  return (
    <div>
      <div className="hidden border-b border-gray-200 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:grid sm:grid-cols-[minmax(0,1fr)_6.5rem_9rem] sm:gap-3">
        <span>Item</span>
        <span className="text-center">Yes / No</span>
        <span>Date(s)</span>
      </div>
      <div className="divide-y divide-gray-100">
        {rows.map((row) => {
          const name = `${base}.${row.key}`;
          return (
            <div
              key={row.key}
              className="flex flex-col gap-2 py-2.5 sm:grid sm:grid-cols-[minmax(0,1fr)_6.5rem_9rem] sm:items-center sm:gap-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="break-words text-[13px] font-medium text-gray-700">{row.label}</span>
                  {row.sides && <SideChecks name={name} />}
                </div>
                {row.specify && (
                  <input
                    {...register(`${name}.specify`)}
                    placeholder={row.specify}
                    aria-label={`${row.label} — ${row.specify}`}
                    maxLength={100}
                    className={`${inputCls} mt-1.5`}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 sm:contents">
                <AnswerButtons name={`${name}.answer`} label={row.label} />
                <input
                  {...register(`${name}.date`)}
                  placeholder="Date(s)"
                  aria-label={`${row.label} — date(s)`}
                  maxLength={40}
                  className={inputCls}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
