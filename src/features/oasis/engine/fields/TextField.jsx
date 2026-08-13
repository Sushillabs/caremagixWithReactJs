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
        {...register(field.fieldId)}
        className="w-full max-w-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </FieldShell>
  );
}
