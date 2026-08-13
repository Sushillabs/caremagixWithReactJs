import { FIELD_WIDGETS } from "./schema";
import { filterVisibleFields } from "./skipLogic";

// The wire-level id(s) a field's answer actually lives under. Most fields are one id;
// composite widgets (checkbox groups, GG/count-grid rows, split dates) are several —
// used here for progress, and reusable later for anything else that needs to walk
// a schema's actual data fields rather than its display fields (e.g. validation).
function fieldLeafIds(field) {
  if (field.checkboxOptions) return field.checkboxOptions.map((o) => o.fieldId);
  if (field.rows) return field.rows.map((r) => r.fieldId);
  if (field.widget === FIELD_WIDGETS.SPLIT_DATE) {
    return field.fieldId ? [`${field.fieldId}_month`, `${field.fieldId}_day`, `${field.fieldId}_year`] : [];
  }
  if (!field.fieldId) return []; // action widgets (email, file-import, ai-assist) aren't data
  return [field.fieldId];
}

function sectionProgress(section, answers) {
  const leafIds = filterVisibleFields(section.items, answers).flatMap(fieldLeafIds);
  if (leafIds.length === 0) return 1;
  const answered = leafIds.filter((id) => {
    const v = answers[id];
    return v !== undefined && v !== null && v !== "" && v !== false;
  }).length;
  return answered / leafIds.length;
}

// Pill navigation + per-section progress (legacy's `.form-section` tabs + progressPct,
// but schema-driven — progress reflects only fields skip-logic actually leaves visible).
export default function SectionNavigator({ sections, activeSectionId, onSelect, answers }) {
  return (
    <nav className="flex flex-wrap gap-2 border-b pb-3 mb-4">
      {sections.map((section) => {
        const pct = Math.round(sectionProgress(section, answers) * 100);
        const active = section.id === activeSectionId;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={
              "px-3 py-1.5 rounded-full text-sm border flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 " +
              (active
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400")
            }
          >
            <span>{section.label}</span>
            <span className={active ? "text-xs text-blue-100" : "text-xs text-gray-400"}>{pct}%</span>
          </button>
        );
      })}
    </nav>
  );
}
