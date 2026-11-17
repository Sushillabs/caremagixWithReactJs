import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const LEVEL_STYLES = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
};

const TREND_ARROWS = { increasing: "↑", decreasing: "↓", stable: "→" };

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-US") : "");

const humanize = (text) => {
  const plain = String(text || "").replaceAll("_", " ");
  return plain.charAt(0).toUpperCase() + plain.slice(1);
};

function LevelBadge({ level }) {
  if (!level) return null;
  const style = LEVEL_STYLES[String(level).toLowerCase()] || "bg-gray-50 text-gray-600 border-gray-200";
  return <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${style}`}>{humanize(level)}</span>;
}

function Section({ title, items, highCount = 0, badge, renderItem }) {
  const [expanded, setExpanded] = useState(false);
  const [isClipped, setIsClipped] = useState(false);
  const firstRef = useRef(null);

  useLayoutEffect(() => {
    const el = firstRef.current;
    setIsClipped(!!el && el.scrollHeight > el.clientHeight + 1);
  }, [items, expanded]);

  const shown = expanded ? items : items.slice(0, 1);
  const moreCount = items.length - 1;
  const canToggle = expanded || moreCount > 0 || isClipped;

  return (
    <div className="rounded-lg border border-gray-200">
      <div className="flex min-h-9 items-center gap-2 px-2.5 compact:min-h-8">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{items.length}</span>
        {highCount > 0 && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">{highCount} high</span>}
      </div>
      <div className="border-t border-gray-100 px-2.5 py-1.5">
        {items.length === 0 ? (
          <p className="text-xs text-gray-400">None found</p>
        ) : (
          <ul className="space-y-1.5">
            {shown.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                {badge && <LevelBadge level={badge(item)} />}
                <div ref={i === 0 ? firstRef : null} className={`min-w-0 flex-1 ${expanded ? "" : "line-clamp-2"}`}>
                  {renderItem(item)}
                </div>
              </li>
            ))}
          </ul>
        )}
        {canToggle && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 inline-flex min-h-8 items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
          >
            {expanded ? "Show less" : moreCount > 0 ? `Show ${moreCount} more` : "Show more"}
            <ChevronDown size={14} className={expanded ? "rotate-180" : ""} />
          </button>
        )}
      </div>
    </div>
  );
}

const SEVERITY_ORDER = { high: 0, medium: 1, moderate: 1, low: 2 };
const bySeverity = (a, b) =>
  (SEVERITY_ORDER[String(a.severity || "").toLowerCase()] ?? 3) - (SEVERITY_ORDER[String(b.severity || "").toLowerCase()] ?? 3);

const countHigh = (items, field) => items.filter((item) => String(item[field] || "").toLowerCase() === "high").length;

export default function BriefView({ brief }) {
  const header = brief?.header || {};
  const riskFlags = [...(brief?.risk_flags || [])].sort(bySeverity);
  const meds = brief?.medication_reconciliation || [];
  const trends = brief?.trends || [];
  const gaps = [...(brief?.care_gaps || [])].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

  const meta = [header.age_years != null && `${header.age_years} yrs`, header.sex].filter(Boolean).join(" · ");
  const range = header.interval_start ? `Records ${formatDate(header.interval_start)} – ${formatDate(header.interval_end)}` : "";

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2">
        <p className="text-sm font-semibold text-gray-800">
          {header.patient_display_name}
          {meta && <span className="ml-2 font-normal text-gray-500">{meta}</span>}
          {range && <span className="ml-2 text-xs font-normal text-gray-500">{range}</span>}
        </p>
        {header.one_line && <p className="text-sm text-gray-700">{header.one_line}</p>}
        {header.sources_present?.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <span className="text-xs text-gray-500">Sources:</span>
            {header.sources_present.map((source) => (
              <span key={source} className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-600">
                {humanize(source)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 md:grid md:grid-cols-2 md:items-start md:gap-2 md:space-y-0">
        <Section
          title="Risk flags"
          items={riskFlags}
          highCount={countHigh(riskFlags, "severity")}
          badge={(flag) => flag.severity}
          renderItem={(flag) => (
            <>
              <span className="font-medium text-gray-800">{flag.domain}: </span>
              {flag.text}
            </>
          )}
        />

        <Section
          title="Medications"
          items={meds}
          renderItem={(med) => (
            <>
              <span className="font-medium text-gray-800">{med.medication || med.drug}: </span>
              {med.finding || med.detail}
            </>
          )}
        />

        <Section
          title="Trends"
          items={trends}
          renderItem={(trend) => (
            <>
              <span className="font-medium text-gray-800">
                {trend.measure} {TREND_ARROWS[trend.direction] || ""}
              </span>
              {trend.values && <span className="ml-2 text-xs text-gray-500">{trend.values}</span>}
              {trend.text && <span className="block">{trend.text}</span>}
            </>
          )}
        />

        <Section
          title="Care gaps"
          items={gaps}
          highCount={countHigh(gaps, "urgency")}
          badge={(gap) => gap.urgency}
          renderItem={(gap) => (
            <>
              <span className="font-medium text-gray-800">{gap.title}: </span>
              {gap.detail}
            </>
          )}
        />
      </div>

      {header.note && <p className="text-xs text-gray-400">{header.note}</p>}
    </div>
  );
}
