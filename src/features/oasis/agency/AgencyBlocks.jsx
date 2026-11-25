import { Controller, useFormContext } from "react-hook-form";

const inputCls =
  "w-full min-w-0 rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-700 focus:border-emerald-500 focus:outline-none";

export function BlockTitle({ children }) {
  return <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">{children}</p>;
}

export function ChecksBlock({ base, items, wide = false }) {
  const { register } = useFormContext();
  return (
    <div className={"grid grid-cols-1 gap-x-4 gap-y-2 " + (wide ? "" : "sm:grid-cols-2 lg:grid-cols-3")}>
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

export function InputsBlock({ base, block }) {
  const { register } = useFormContext();
  return (
    <div
      className={
        "grid gap-x-3 gap-y-2 " +
        (block.wide ? "grid-cols-1" : block.pairs ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3")
      }
    >
      {block.items.map((item) => (
        <label key={item.key} className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] font-medium text-gray-600">{item.label}</span>
          <input
            {...register(`${base}.${item.key}`)}
            type={item.date ? "date" : "text"}
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

export function ChoiceBlock({ base, block }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={`${base}.${block.key}`}
      control={control}
      defaultValue=""
      render={({ field: { value, onChange } }) => (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-[13px] font-medium text-gray-700">{block.label}</span>
          <div className="flex gap-1.5">
            {block.options.map(([option, text]) => {
              const selected = value === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${block.label} — ${text}`}
                  onClick={() => onChange(selected ? "" : option)}
                  className={
                    "h-8 min-w-14 rounded-md border px-3 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 " +
                    (selected
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50")
                  }
                >
                  {text}
                </button>
              );
            })}
          </div>
        </div>
      )}
    />
  );
}

export function ChoicesBlock({ base, rows }) {
  const { register } = useFormContext();
  return (
    <div className="divide-y divide-gray-100">
      {rows.map((choice) => (
        <div key={choice.key} className="flex flex-col gap-1.5 py-2">
          <ChoiceBlock base={base} block={choice} />
          {choice.detail && (
            <input
              {...register(`${base}.${choice.detail.key}`)}
              type={choice.detail.date ? "date" : "text"}
              placeholder={choice.detail.placeholder}
              aria-label={`${choice.label} — ${choice.detail.placeholder}`}
              maxLength={60}
              className={`${inputCls} sm:max-w-xs`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function ImageBlock({ block }) {
  return (
    <figure className="m-0">
      <img
        src={block.src}
        alt={block.alt}
        loading="lazy"
        className="mx-auto block h-auto max-h-80 w-full max-w-3xl rounded-md border border-gray-200 bg-white object-contain p-2"
      />
      {block.caption && <figcaption className="mt-1.5 text-[11px] italic text-gray-500">{block.caption}</figcaption>}
    </figure>
  );
}

export function NotesBlock({ base, block }) {
  const { register } = useFormContext();
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-gray-600">{block.label}</span>
      <textarea {...register(`${base}.${block.key}`)} rows={block.lines ?? 3} maxLength={2000} className={`${inputCls} resize-y`} />
    </label>
  );
}
