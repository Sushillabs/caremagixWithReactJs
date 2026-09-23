import { X } from "lucide-react";
import { errorFieldKeys, errorLabel, findSectionIdForField } from "./validation";

const MAX_ALLOWED_SHOWN = 8;

function allowedSummary(error) {
  const allowed = error?.allowed_values ?? [];
  const shown = allowed.slice(0, MAX_ALLOWED_SHOWN).join(", ");
  return allowed.length > MAX_ALLOWED_SHOWN ? `${shown}…` : shown;
}

function sectionLabel(schema, sectionId) {
  return schema?.sections?.find((s) => s.id === sectionId)?.label ?? sectionId ?? "";
}

export default function ValidationErrorPanel({ schema, errors, headline, topLevel, onDismiss, onJump }) {
  const hasErrors = Array.isArray(errors) && errors.length > 0;
  if (!hasErrors && !topLevel) return null;

  return (
    <div className="mb-4 rounded-lg border-2 border-red-500 bg-red-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-red-700">
          {topLevel
            ? topLevel.error || "Submission Error"
            : `${errors.length} validation error${errors.length === 1 ? "" : "s"} — ${headline || "Please correct and try again"}`}
        </p>
        <button type="button" onClick={onDismiss} className="text-red-600 hover:text-red-800" title="Dismiss">
          <X size={16} />
        </button>
      </div>

      {topLevel ? (
        <div className="mt-2 rounded-md border border-red-200 bg-white p-3">
          <p className="text-xs text-red-600">
            {topLevel.details || "Please check your assessment and try again."}
          </p>
          {Object.entries(topLevel)
            .filter(([key]) => key !== "error" && key !== "details" && key !== "validation_errors")
            .map(([key, value]) => (
              <p key={key} className="mt-1 text-xs text-gray-600">
                <span className="font-semibold">{key}:</span>{" "}
                {value ? String(value) : <em className="text-red-600">(empty)</em>}
              </p>
            ))}
        </div>
      ) : (
        <div className="mt-2 max-h-72 overflow-y-auto">
          {errors.map((error, i) => {
            const primaryKey = errorFieldKeys(error)[0];
            const sectionId = findSectionIdForField(schema, primaryKey);
            return (
              <button
                key={`${primaryKey}-${i}`}
                type="button"
                onClick={() => onJump?.(primaryKey, sectionId)}
                className="flex w-full items-center gap-2.5 border-b border-red-200 px-2 py-2 text-left last:border-0 hover:bg-red-100"
              >
                <span className="shrink-0 rounded bg-blue-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {sectionLabel(schema, sectionId)}
                </span>
                <span className="w-28 shrink-0 font-mono text-xs font-bold text-red-700">{errorLabel(error)}</span>
                <span className="text-xs text-gray-600">
                  → "{error.provided_value}" should be: {allowedSummary(error)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
