import { useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

// Text input + "Unknown/NA" sibling checkbox (§1.7) — e.g. M0018/M0018_UK (NPI),
// M0063/M0063_MEDICARE_NA. Distinct from SplitDateField's NA pairing, which is a
// date triplet rather than a single text value.
export default function TextUnknownField({ field }) {
  const { register } = useFormContext();
  return (
    <FieldShell field={field}>
      <div className="flex items-center gap-3">
        <input
          type="text"
          maxLength={field.maxLength}
          {...register(field.fieldId)}
          className="w-40 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {field.pairedField && (
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="checkbox" {...register(field.pairedField.fieldId)} />
            {field.pairedField.label}
          </label>
        )}
      </div>
    </FieldShell>
  );
}
