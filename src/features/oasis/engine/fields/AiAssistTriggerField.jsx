// Non-data-bearing plugin trigger (§1.16) — e.g. SOC's "Get ICD Recommendations"
// button. Not a field itself; the extension point the Coding Assistant plugin binds
// to (§E/§H Phase 3). Disabled until a plugin supplies `onTrigger`, matching legacy's
// disabled-until-init behavior.
export default function AiAssistTriggerField({ field, onTrigger }) {
  return (
    <button
      type="button"
      disabled={!onTrigger}
      onClick={onTrigger}
      className="border border-blue-300 text-blue-700 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {field.label ?? "Get ICD Recommendations"}
    </button>
  );
}
