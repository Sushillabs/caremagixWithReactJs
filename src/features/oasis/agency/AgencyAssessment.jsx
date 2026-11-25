import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AGENCY_KEY, AGENCY_SECTIONS } from "./agencySections";
import YesNoDateRows from "./YesNoDateRows";
import { BlockTitle, ChecksBlock, ChoiceBlock, ImageBlock, InputsBlock, NotesBlock } from "./AgencyBlocks";

function Block({ base, block }) {
  if (block.type === "yesNo") return <YesNoDateRows base={base} rows={block.rows} />;
  if (block.type === "checks") return <ChecksBlock base={base} items={block.items} />;
  if (block.type === "inputs") return <InputsBlock base={base} block={block} />;
  if (block.type === "notes") return <NotesBlock base={base} block={block} />;
  if (block.type === "choice") return <ChoiceBlock base={base} block={block} />;
  if (block.type === "image") return <ImageBlock block={block} />;
  return null;
}

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
        const base = `${AGENCY_KEY}.${section.id}`;
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
            <div hidden={!open} className="border-t border-gray-100 px-4 pb-4">
              {section.hint && <p className="mt-3 text-xs italic text-gray-500">{section.hint}</p>}
              {section.blocks.map((block, index) => (
                <div key={block.title ?? `${block.type}-${index}`} className="pt-3">
                  {block.title && <BlockTitle>{block.title}</BlockTitle>}
                  <Block base={base} block={block} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
