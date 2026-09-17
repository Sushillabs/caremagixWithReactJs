import { filterVisibleFields } from "./skipLogic";
import { fieldLeafIds } from "./payload";

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
export default function SectionNavigator({ sections, activeSectionId, onSelect, answers, sectionsWithErrors }) {
  return (
    <nav className="flex flex-wrap gap-2 border-b pb-3 mb-4">
      {sections.map((section) => {
        const pct = Math.round(sectionProgress(section, answers) * 100);
        const active = section.id === activeSectionId;
        const hasError = sectionsWithErrors?.has(section.id);
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={
              "relative px-3 py-1.5 rounded-full text-sm border flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 " +
              (active
                ? "bg-blue-600 text-white border-blue-600"
                : hasError
                ? "bg-red-50 text-red-600 border-red-500"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400")
            }
          >
            <span>{section.label}</span>
            <span className={active ? "text-xs text-blue-100" : "text-xs text-gray-400"}>{pct}%</span>
            {hasError && <span className="absolute right-1.5 top-1 h-1.5 w-1.5 rounded-full bg-red-600" />}
          </button>
        );
      })}
    </nav>
  );
}
