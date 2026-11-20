import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AGENCY_KEY, AGENCY_SECTIONS } from "./agencySections";
import YesNoDateRows from "./YesNoDateRows";

export default function AgencyAssessment() {
  const [openIds, setOpenIds] = useState(() => new Set([AGENCY_SECTIONS[0].id]));

  const toggle = (id) =>
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
        Agency assessment — not part of CMS OASIS. Saved with this form, never sent in the CMS XML.
      </p>
      {AGENCY_SECTIONS.map((section) => {
        const open = openIds.has(section.id);
        return (
          <div key={section.id} className="rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => toggle(section.id)}
              aria-expanded={open}
              className="flex min-h-11 w-full items-center justify-between gap-2 px-4 py-3 text-left"
            >
              <span className="text-sm font-semibold text-gray-800">{section.label}</span>
              <ChevronDown size={16} className={"shrink-0 text-gray-400 transition-transform " + (open ? "rotate-180" : "")} />
            </button>
            <div hidden={!open} className="border-t border-gray-100 px-4 pb-3">
              {section.groups.map((group) => (
                <div key={group.title} className="pt-3">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">{group.title}</p>
                  <YesNoDateRows base={`${AGENCY_KEY}.${section.id}`} rows={group.rows} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
