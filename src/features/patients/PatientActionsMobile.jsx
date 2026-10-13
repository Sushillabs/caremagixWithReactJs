import { useState } from "react";
import { ChevronRight, Ellipsis, Home } from "lucide-react";
import BottomSheet from "../../components/BottomSheet";

const GROUPS = ["Documents", "Care", "Contact"];

export default function PatientActionsMobile({ actions, mainKeys, onHome }) {
  const [sheet, setSheet] = useState(null);
  const visible = actions.filter((a) => a.show);
  const main = mainKeys.map((k) => visible.find((a) => a.key === k)).filter(Boolean);
  const rest = visible.filter((a) => !mainKeys.includes(a.key));
  const listAction = sheet && sheet !== "more" ? visible.find((a) => a.key === sheet) : null;

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
        className="flex h-9 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600"
      >
        <Home size={16} />
      </button>
      {main.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.key}
            type="button"
            onClick={() => run(action)}
            disabled={action.disabled}
            className="flex h-9 min-w-0 flex-auto items-center justify-center gap-1 rounded-full border border-gray-200 bg-white px-1.5 text-xs text-gray-700 disabled:opacity-50"
          >
            <Icon size={14} className="shrink-0 text-emerald-600" />
            <span className="truncate">{action.label}</span>
          </button>
        );
      })}
      {rest.length > 0 && (
        <button
          type="button"
          onClick={() => setSheet("more")}
          aria-label="More actions"
          className="flex h-9 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600"
        >
          <Ellipsis size={18} />
        </button>
      )}

      <BottomSheet open={sheet === "more"} onClose={() => setSheet(null)} title="More actions">
        {GROUPS.map((group) => {
          const items = rest.filter((a) => a.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="px-2">
              <p className="mb-1.5 mt-3 text-xs text-gray-500">{group}</p>
              <div className="grid grid-cols-3 gap-2">
                {items.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.key}
                      type="button"
                      onClick={() => run(action)}
                      disabled={action.disabled}
                      className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-1 py-2 text-center text-xs text-gray-700 active:bg-gray-50 disabled:text-gray-300"
                    >
                      <Icon size={22} className={action.disabled ? "text-gray-300" : "text-emerald-600"} />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </BottomSheet>

      <BottomSheet open={Boolean(listAction)} onClose={() => setSheet(null)} title={listAction?.label}>
        {listAction?.items.length === 0 && <p className="px-3 py-6 text-center text-sm text-gray-400">Nothing here yet.</p>}
        <ul>
          {listAction?.items.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => {
                  setSheet(null);
                  listAction.onItemClick(item);
                }}
                className="flex min-h-12 w-full items-center justify-between gap-2 rounded-lg px-3 text-left text-sm text-gray-700 active:bg-gray-50"
              >
                <span className="min-w-0 break-words">{item}</span>
                <ChevronRight size={16} className="shrink-0 text-gray-300" />
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </div>
  );
}
