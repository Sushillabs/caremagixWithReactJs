import { useFieldErrors } from "../ValidationContext";

export default function FieldShell({ field, children }) {
  const fieldErrors = useFieldErrors(field);

  return (
    <div className={"py-2" + (fieldErrors.length ? " -mx-2 rounded-lg border-2 border-red-400 bg-red-50 px-2" : "")}>
      <div className="flex items-baseline gap-2 mb-1">
        {field.itemCode && (
          <span className="font-mono text-xs text-gray-400">{field.itemCode}</span>
        )}
        <span className="text-sm font-medium text-gray-800">{field.label}</span>
      </div>
      {field.description && <p className="mb-2 text-xs text-gray-500">{field.description}</p>}
      {children}
      {field.skipWhen?.note && (
        <p className="mt-1 text-xs text-gray-500 italic">{field.skipWhen.note}</p>
      )}
      {fieldErrors.map(({ fieldId, error }, i) => (
        <p key={`${fieldId}-${i}`} className="mt-1 border-l-[3px] border-red-500 bg-red-50 px-2 py-1 font-mono text-xs text-red-700">
          ⚠ {fieldId}: "{error.provided_value}" not allowed. Allowed: {(error.allowed_values ?? []).join(", ")}
        </p>
      ))}
    </div>
  );
}
