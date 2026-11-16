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

function Section({ title, items, highCount = 0, defaultOpen = false, children }) {
  return (
    <details open={defaultOpen} className="group rounded-lg border border-gray-200">
      <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 px-2.5 compact:min-h-8 [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{items.length}</span>
        {highCount > 0 && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">{highCount} high</span>}
        <ChevronDown size={16} className="ml-auto text-gray-400 group-open:rotate-180" />
      </summary>
      <div className="border-t border-gray-100 px-2.5 py-1.5">
        {items.length === 0 ? <p className="text-xs text-gray-400">None found</p> : <ul className="space-y-1.5">{children}</ul>}
      </div>
    </details>
  );
}

const countHigh = (items, field) => items.filter((item) => String(item[field] || "").toLowerCase() === "high").length;

export default function BriefView({ brief }) {
  const header = brief?.header || {};
  const riskFlags = brief?.risk_flags || [];
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
        <Section title="Risk flags" items={riskFlags} highCount={countHigh(riskFlags, "severity")} defaultOpen>
          {riskFlags.map((flag, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <LevelBadge level={flag.severity} />
              <span>
                <span className="font-medium text-gray-800">{flag.domain}: </span>
                {flag.text}
              </span>
            </li>
          ))}
        </Section>

        <Section title="Medications" items={meds}>
          {meds.map((med, i) => (
            <li key={i} className="text-sm text-gray-700">
              <span className="font-medium text-gray-800">{med.medication || med.drug}: </span>
              {med.finding || med.detail}
              {med.sources?.length > 0 && <p className="text-xs text-gray-400">{med.sources.join(" · ")}</p>}
            </li>
          ))}
        </Section>

        <Section title="Trends" items={trends}>
          {trends.map((trend, i) => (
            <li key={i} className="text-sm text-gray-700">
              <span className="font-medium text-gray-800">
                {trend.measure} {TREND_ARROWS[trend.direction] || ""}
              </span>
              {trend.values && <span className="ml-2 text-xs text-gray-500">{trend.values}</span>}
              {trend.text && <p>{trend.text}</p>}
            </li>
          ))}
        </Section>

        <Section title="Care gaps" items={gaps} highCount={countHigh(gaps, "urgency")}>
          {gaps.map((gap, i) => (
            <li key={gap.gap_id || i} className="flex items-start gap-2 text-sm text-gray-700">
              <LevelBadge level={gap.urgency} />
              <span>
                <span className="font-medium text-gray-800">{gap.title}: </span>
                {gap.detail}
              </span>
            </li>
          ))}
        </Section>
      </div>

      {header.note && <p className="text-xs text-gray-400">{header.note}</p>}
    </div>
  );
}
