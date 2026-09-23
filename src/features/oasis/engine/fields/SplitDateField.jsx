import { useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

const boxCls =
  "h-11 rounded-lg border border-gray-300 text-center text-[15px] text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500";
const capCls = "text-[10px] font-semibold uppercase tracking-wide text-gray-400";

export default function SplitDateField({ field }) {
  const { register } = useFormContext();
  const base = field.fieldId;

  return (
    <FieldShell field={field}>
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <span className={capCls}>Month</span>
          <input type="text" maxLength={2} placeholder="MM" {...register(`${base}_month`)} className={`${boxCls} w-16`} />
        </div>
        <span className="pb-3 text-gray-300">/</span>
        <div className="flex flex-col gap-1">
          <span className={capCls}>Day</span>
          <input type="text" maxLength={2} placeholder="DD" {...register(`${base}_day`)} className={`${boxCls} w-16`} />
        </div>
        <span className="pb-3 text-gray-300">/</span>
        <div className="flex flex-col gap-1">
          <span className={capCls}>Year</span>
          <input type="text" maxLength={4} placeholder="YYYY" {...register(`${base}_year`)} className={`${boxCls} w-20`} />
        </div>

        {field.pairedField && (
          <label className="flex cursor-pointer items-center gap-1.5 pb-3 pl-2 text-xs text-gray-600">
            <input type="checkbox" {...register(field.pairedField.fieldId)} className="accent-emerald-600" />
            {field.pairedField.label}
          </label>
        )}
      </div>
    </FieldShell>
  );
}
