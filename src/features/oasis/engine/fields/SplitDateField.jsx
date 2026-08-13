import { useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

// MM/DD/YYYY triplet (§1.3) — three plain text inputs, never a native date picker
// (legacy never uses type="date" outside the prefill modal). Optional pairedField
// renders the sibling NA/UK checkbox that gates the date's relevance (e.g. M0102_..._NA).
export default function SplitDateField({ field }) {
  const { register } = useFormContext();
  const base = field.fieldId;
  return (
    <FieldShell field={field}>
      <div className="flex items-end gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Month</label>
          <input
            type="text"
            maxLength={2}
            placeholder="MM"
            {...register(`${base}_month`)}
            className="w-14 border rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="pb-2 text-gray-400">—</span>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Day</label>
          <input
            type="text"
            maxLength={2}
            placeholder="DD"
            {...register(`${base}_day`)}
            className="w-14 border rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="pb-2 text-gray-400">—</span>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Year</label>
          <input
            type="text"
            maxLength={4}
            placeholder="YYYY"
            {...register(`${base}_year`)}
            className="w-18 border rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {field.pairedField && (
          <label className="flex items-center gap-1.5 text-sm ml-3 pb-2 cursor-pointer">
            <input type="checkbox" {...register(field.pairedField.fieldId)} />
            {field.pairedField.label}
          </label>
        )}
      </div>
    </FieldShell>
  );
}
