import { useFormContext } from "react-hook-form";

const inputCls =
  "w-full min-w-0 rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-700 focus:border-emerald-500 focus:outline-none";

export function BlockTitle({ children }) {
  return <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">{children}</p>;
}

export function ChecksBlock({ base, items }) {
  const { register } = useFormContext();
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.key} className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <label className="flex min-h-8 items-center gap-2 text-[13px] text-gray-700">
            <input type="checkbox" {...register(`${base}.${item.key}`)} className="h-4 w-4 shrink-0 accent-emerald-600" />
            {item.label}
          </label>
          {item.details?.map((detail) =>
            detail.options ? (
              <select
                key={detail.key}
                {...register(`${base}.${detail.key}`)}
                aria-label={`${item.label} — ${detail.placeholder}`}
                className={`${inputCls} w-20 flex-none`}
              >
                <option value="">{detail.placeholder}</option>
                {detail.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                key={detail.key}
                {...register(`${base}.${detail.key}`)}
                placeholder={detail.placeholder}
                aria-label={`${item.label} — ${detail.placeholder}`}
                inputMode={detail.numeric ? "decimal" : undefined}
                maxLength={60}
                className={`${inputCls} flex-1 basis-24`}
              />
            )
          )}
        </div>
      ))}
    </div>
  );
}

export function InputsBlock({ base, items }) {
  const { register } = useFormContext();
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
      {items.map((item) => (
        <label key={item.key} className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] font-medium text-gray-600">{item.label}</span>
          <input
            {...register(`${base}.${item.key}`)}
            placeholder={item.placeholder}
            inputMode={item.numeric ? "decimal" : undefined}
            maxLength={60}
            className={inputCls}
          />
        </label>
      ))}
    </div>
  );
}

export function NotesBlock({ base, block }) {
  const { register } = useFormContext();
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-gray-600">{block.label}</span>
      <textarea {...register(`${base}.${block.key}`)} rows={3} maxLength={1000} className={`${inputCls} resize-y`} />
    </label>
  );
}
