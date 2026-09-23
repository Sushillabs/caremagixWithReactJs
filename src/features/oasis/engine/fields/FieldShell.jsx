import { useFieldErrors } from "../ValidationContext";

export default function FieldShell({ field, children, headerRight }) {
  const fieldErrors = useFieldErrors(field);

  return (
    <div
      className={
        "rounded-lg border bg-white p-4 " + (fieldErrors.length ? "border-red-300" : "border-gray-200")
      }
    >
      <div className="mb-3 flex items-start gap-2.5">
        {field.itemCode && (
          <span className="mt-0.5 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-500">
            {field.itemCode}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-800">{field.label}</p>
          {field.description && <p className="mt-1 text-xs text-gray-500">{field.description}</p>}
        </div>
        {headerRight}
      </div>

      {children}

      {field.skipWhen?.note && <p className="mt-2 text-xs italic text-gray-500">{field.skipWhen.note}</p>}

      {fieldErrors.map(({ fieldId, error }, i) => (
        <div
          key={`${fieldId}-${i}`}
          className="mt-2 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-2"
        >
          <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
          <p className="text-[11px] text-red-700">
            <span className="font-mono">{fieldId}</span>: "{error.provided_value}" not allowed. Allowed:{" "}
            {(error.allowed_values ?? []).join(", ")}
          </p>
        </div>
      ))}
    </div>
  );
}
