import { useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

// "Check all that apply" (§1.2) — each checkbox is its OWN independent boolean CMS
// field (own fieldId), not a shared value list. Layout variant (single column / two-col
// grid / special-tx grid) is a display concern only; same field semantics either way.
export default function CheckboxGroupField({ field }) {
  const { register } = useFormContext();
  const layout = field.layout ?? "list";
  const gridClass =
    layout === "two-col" ? "grid grid-cols-2 gap-x-4 gap-y-1"
    : layout === "grid-3" ? "grid grid-cols-3 gap-x-4 gap-y-1"
    : "space-y-1";

  return (
    <FieldShell field={field}>
      <div className={gridClass}>
        {field.checkboxOptions?.map((opt) => (
          <label key={opt.fieldId} className="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register(opt.fieldId)} className="mt-1" />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </FieldShell>
  );
}
