// Shared header/wrapper every field widget renders inside — the itemCode + label +
// skip-hint chrome is identical across all 13 widgets (legacy's `.q-id` + `.q-label`),
// so widgets only need to render their own input controls.
export default function FieldShell({ field, children }) {
  return (
    <div className="py-2">
      <div className="flex items-baseline gap-2 mb-1">
        {field.itemCode && (
          <span className="font-mono text-xs text-gray-400">{field.itemCode}</span>
        )}
        <span className="text-sm font-medium text-gray-800">{field.label}</span>
      </div>
      {children}
      {field.skipWhen?.note && (
        <p className="mt-1 text-xs text-gray-500 italic">{field.skipWhen.note}</p>
      )}
    </div>
  );
}
