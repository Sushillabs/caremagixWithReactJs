import { useLayoutEffect, useRef, useState } from "react";
import { ChevronRight, Ellipsis, Home, Trash2 } from "lucide-react";
import BottomSheet from "../../components/BottomSheet";

const GROUPS = ["Documents", "Care", "Contact"];
const CHIP_GAP = 4;
const CHIP_CLASS =
  "flex min-h-9 shrink-0 compact:min-h-8 items-center justify-center gap-1 whitespace-nowrap rounded-full border border-gray-200 bg-white px-2 text-xs text-gray-700 disabled:opacity-50";

function ChipContent({ action }) {
  const Icon = action.icon;
  return (
    <>
      <Icon size={14} className="shrink-0 text-emerald-600" />
      {action.label}
    </>
  );
}

function SheetTile({ action, onRun }) {
  const Icon = action.icon;
  return (
    <button
      type="button"
      onClick={() => onRun(action)}
      disabled={action.disabled}
      className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-1 py-2 text-center text-xs text-gray-700 active:bg-gray-50 disabled:text-gray-300"
    >
      <Icon size={22} className={action.disabled ? "text-gray-300" : "text-emerald-600"} />
      {action.label}
    </button>
  );
}

export default function PatientActionsMobile({ actions, mainKeys, onHome }) {
  const [sheet, setSheet] = useState(null);
  const visible = actions.filter((a) => a.show);
  const main = mainKeys.map((k) => visible.find((a) => a.key === k)).filter(Boolean);
  const rest = visible.filter((a) => !mainKeys.includes(a.key));
  const listAction = sheet && sheet !== "more" ? visible.find((a) => a.key === sheet) : null;

  // Show only the main chips that fully fit (width depends on screen, text size and labels); the rest move into More.
  const slotRef = useRef(null);
  const measureRef = useRef(null);
  const [fitCount, setFitCount] = useState(main.length);
  const mainSignature = main.map((a) => a.label).join("|");

  useLayoutEffect(() => {
    const slot = slotRef.current;
    const measure = measureRef.current;
    if (!slot || !measure) return;
    const compute = () => {
      const available = slot.clientWidth;
      let used = 0;
      let count = 0;
      for (const chip of measure.children) {
        const next = used + (count ? CHIP_GAP : 0) + chip.offsetWidth;
        if (next > available) break;
        used = next;
        count += 1;
      }
      setFitCount(count);
    };
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(slot);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [mainSignature]);

  const shownMain = main.slice(0, fitCount);
  const overflowMain = main.slice(fitCount);
  const hasMore = overflowMain.length > 0 || rest.length > 0;

  const run = (action) => {
    if (action.disabled) return;
    if (action.items) {
      setSheet(action.key);
      return;
    }
    setSheet(null);
    action.onClick();
  };

  return (
    <div className="flex items-center gap-1 md:col-span-3 lg:hidden [[data-chat-active]_&]:hidden">
      <button
        type="button"
        onClick={onHome}
        aria-label="Home"
        className="flex h-9 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 compact:h-8"
      >
        <Home size={16} />
      </button>
      <div ref={slotRef} className="relative flex min-w-0 flex-1 gap-1">
        {shownMain.map((action) => (
          <button key={action.key} type="button" onClick={() => run(action)} disabled={action.disabled} className={`${CHIP_CLASS} flex-auto`}>
            <ChipContent action={action} />
          </button>
        ))}
        <div aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 h-0 w-0 overflow-hidden">
          <div ref={measureRef} className="flex w-max gap-1">
            {main.map((action) => (
              <span key={action.key} className={CHIP_CLASS}>
                <ChipContent action={action} />
              </span>
            ))}
          </div>
        </div>
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setSheet("more")}
          aria-label="More actions"
          className="flex h-9 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 compact:h-8"
        >
          <Ellipsis size={18} />
        </button>
      )}

      <BottomSheet open={sheet === "more"} onClose={() => setSheet(null)} title="More actions">
        {overflowMain.length > 0 && (
          <div className="px-2">
            <div className="mt-3 grid grid-cols-3 gap-2">
              {overflowMain.map((action) => (
                <SheetTile key={action.key} action={action} onRun={run} />
              ))}
            </div>
          </div>
        )}
        {GROUPS.map((group) => {
          const items = rest.filter((a) => a.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="px-2">
              <p className="mb-1.5 mt-3 text-xs text-gray-500">{group}</p>
              <div className="grid grid-cols-3 gap-2">
                {items.map((action) => (
                  <SheetTile key={action.key} action={action} onRun={run} />
                ))}
              </div>
            </div>
          );
        })}
      </BottomSheet>

      <BottomSheet open={Boolean(listAction)} onClose={() => setSheet(null)} title={listAction?.label}>
        {listAction?.items.length === 0 && <p className="px-3 py-6 text-center text-sm text-gray-400">Nothing here yet.</p>}
        <ul>
          {listAction?.items.map((item) => (
            <li key={item} className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  setSheet(null);
                  listAction.onItemClick(item);
                }}
                className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-2 rounded-lg px-3 text-left text-sm text-gray-700 active:bg-gray-50"
              >
                <span className="min-w-0 break-words">{item}</span>
                <ChevronRight size={16} className="shrink-0 text-gray-300" />
              </button>
              {listAction.onItemDelete && listAction.canDeleteItem?.(item) !== false && (
                <button
                  type="button"
                  aria-label={`Delete ${item}`}
                  onClick={() => {
                    setSheet(null);
                    listAction.onItemDelete(item);
                  }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-400 active:bg-red-50 active:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </BottomSheet>
    </div>
  );
}
