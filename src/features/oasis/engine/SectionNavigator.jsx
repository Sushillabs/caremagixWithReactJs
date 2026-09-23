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

function barColor({ active, hasError, pct }) {
  if (hasError) return "bg-red-500";
  if (pct === 100) return "bg-emerald-500";
  if (active) return "bg-emerald-500";
  return "bg-gray-300";
}

export default function SectionNavigator({ sections, activeSectionId, onSelect, answers, sectionsWithErrors }) {
  return (
    <nav className="-mx-2 flex flex-wrap gap-x-1 gap-y-1">
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
              "group flex min-w-[104px] cursor-pointer flex-col gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors focus:outline-none focus:ring-emerald-500/40 " +
              (active ? "bg-emerald-50/70 hover:bg-emerald-50" : "hover:bg-gray-100")
            }
          >
            <span className="flex items-center gap-1.5">
              <span
                className={
                  "text-xs " +
                  (hasError ? "font-semibold text-red-600" : active ? "font-semibold text-emerald-700" : "text-gray-500 group-hover:text-gray-700")
                }
              >
                {section.label}
              </span>
              <span className={"text-[11px] " + (active ? "text-emerald-500" : "text-gray-300")}>{pct}%</span>
              {hasError && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
            </span>
            <span className="h-[3px] w-full overflow-hidden rounded-full bg-gray-200 group-hover:bg-gray-300">
              <span className={"block h-full rounded-full transition-all " + barColor({ active, hasError, pct })} style={{ width: `${pct}%` }} />
            </span>
          </button>
        );
      })}
    </nav>
  );
}
