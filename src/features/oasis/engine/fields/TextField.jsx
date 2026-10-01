import { useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

// Plain free-text input (§1.4) — e.g. A1110A preferred language, M0016 branch id.
export default function TextField({ field }) {
  const { register } = useFormContext();
  return (
    <FieldShell field={field}>
      <input
        type="text"
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        {...register(field.fieldId)}
        className="h-10 w-full max-w-xs rounded-lg border border-gray-300 px-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </FieldShell>
  );
}
