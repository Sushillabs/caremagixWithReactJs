import { Info, CheckCircle2 } from "lucide-react";

// Cosmetic-only color mapping. The backend does not send a color for each
// MMTA category — we guess one from the category text so different
// categories are visually distinct at a glance. Purely a frontend choice,
// safe to change any time, does not depend on backend data.
const CATEGORY_COLOR_KEYWORDS = [
  [["cardiac", "circulatory"], "rose"],
  [["respiratory"], "sky"],
  [["endocrine"], "violet"],
  [["gi", "gu", "gastro", "genito"], "amber"],
  [["infectious", "neoplasm", "blood"], "orange"],
  [["surgical", "aftercare"], "emerald"],
  [["behavioral"], "indigo"],
];
const BADGE_CLASSES = {
  rose: "bg-rose-50 text-rose-600",
  sky: "bg-sky-50 text-sky-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
  orange: "bg-orange-50 text-orange-600",
  emerald: "bg-emerald-50 text-emerald-600",
  indigo: "bg-indigo-50 text-indigo-600",
  slate: "bg-slate-100 text-slate-600",
};

function getCategoryTone(categoryText) {
  const haystack = (categoryText || "").toLowerCase();
  for (const [keywords, tone] of CATEGORY_COLOR_KEYWORDS) {
    if (keywords.some((keyword) => haystack.includes(keyword))) return tone;
  }
  return "slate";
}

// icd_codes / cpt_codes both come as { value, note } — same shape, one
// small component covers both columns.
function CodeCell({ code }) {
  if (!code?.value) return <span className="text-gray-300">—</span>;
  return (
    <div>
      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-700">{code.value}</code>
      {code.note && <p className="mt-1 text-[10px] text-gray-400">{code.note}</p>}
    </div>
  );
}

// Renders ONLY the structured `mmta` object from the response — the
// question and the plain-markdown `response` fallback are not shown here
// on purpose (matches what was asked: response only, no "Q:" line).
export default function MmtaAnswer({ mmta }) {
  if (!mmta) return null;

  const { title, subtitle, intro, columns, rows, additional_guidance, action, summary } = mmta;

  return (
    <div className="flex flex-col gap-4 text-sm text-gray-700">
      {/* {(title || subtitle) && (
        <div>
          {title && <h3 className="text-base font-semibold text-gray-800">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )} */}

      {intro && <p className="text-gray-600">{intro}</p>}
      {rows?.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                {(columns || []).map((col) => (
                  <th key={col} className="px-3 py-2 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const tone = getCategoryTone(row.mmta_categorization);
                return (
                  <tr key={row.scenario || i} className="border-b border-gray-50 align-top last:border-0">
                    <td className="px-3 py-3 font-medium text-gray-800">{row.scenario}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${BADGE_CLASSES[tone]}`}>{row.mmta_categorization}</span>
                    </td>
                    <td className="px-3 py-3">
                      <CodeCell code={row.icd_codes} />
                    </td>
                    <td className="px-3 py-3">
                      <CodeCell code={row.cpt_codes} />
                    </td>
                    <td className="px-3 py-3 text-gray-600">{row.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Additional guidance — own callout box, not buried inside a
          paragraph, so it doesn't get skipped while scanning the table. */}
      {additional_guidance?.length > 0 && (
        <div className="rounded-lg border border-sky-100 bg-sky-50 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-sky-700">
            <Info size={14} /> Additional Guidance
          </div>
          <ul className="space-y-1 text-xs text-sky-800">
            {additional_guidance.map((g, i) => (
              <li key={g.label || i}>
                <span className="font-medium">{g.label}:</span> {g.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action — the one thing the caregiver should DO. Styled to stand
          out from the rest of the text, not just another line. */}
      {action && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
          <p className="text-xs text-emerald-800">
            <span className="font-semibold">Recommended action: </span>
            {action}
          </p>
        </div>
      )}

      {summary && <p className="text-xs italic text-gray-400">{summary}</p>}
    </div>
  );
}
