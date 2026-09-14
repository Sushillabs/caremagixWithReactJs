import { useNavigate } from "react-router-dom";
import { Heart, TriangleAlert, ShieldCheck, ClipboardList, Users, Ban } from "lucide-react";

const DONUT_SIZE = 140;
const DONUT_STROKE = 16;
const DONUT_GAP = 3; // px of circumference left blank between segments, so they read as separate

function ProgressDonut({ started, inProgress, complete, overallPercent }) {
  const radius = (DONUT_SIZE - DONUT_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = started + inProgress + complete || 1;

  let cursor = 0;
  const arcs = [
    { value: started, color: "#3b82f6" },
    { value: inProgress, color: "#f59e0b" },
    { value: complete, color: "#10b981" },
  ].map((seg) => {
    const rawLength = (seg.value / total) * circumference;
    const arc = { color: seg.color, length: Math.max(rawLength - DONUT_GAP, 0), offset: cursor };
    cursor += rawLength;
    return arc;
  });

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center">
      <svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`} className="-rotate-90">
        <circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={DONUT_STROKE}
        />
        {arcs.map(
          (arc, i) =>
            arc.length > 0 && (
              <circle
                key={i}
                cx={DONUT_SIZE / 2}
                cy={DONUT_SIZE / 2}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={DONUT_STROKE}
                strokeDasharray={`${arc.length} ${circumference - arc.length}`}
                strokeDashoffset={-arc.offset}
              />
            )
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-800">{overallPercent}%</span>
        <span className="text-[10px] text-gray-400">Overall Progress</span>
      </div>
    </div>
  );
}

const LEGEND_ITEMS = [
  { key: "started", label: "Started", color: "#3b82f6" },
  { key: "in_progress", label: "In Progress", color: "#f59e0b" },
  { key: "complete", label: "Complete", color: "#10b981" },
  { key: "total_parameters", label: "Total Parameters", color: "#94a3b8" },
];

const RISK_CARDS = [
  { key: "high_risk", icon: Heart, tone: "red" },
  { key: "moderate_risk", icon: TriangleAlert, tone: "amber" },
  { key: "low_risk", icon: ShieldCheck, tone: "emerald" },
  { key: "diagnoses", icon: ClipboardList, tone: "sky" },
  { key: "interventions", icon: Users, tone: "violet" },
  { key: "not_accessed", icon: Ban, tone: "slate" },
];

const TONE_CLASSES = {
  red: "bg-red-50 text-red-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  sky: "bg-sky-50 text-sky-600",
  violet: "bg-violet-50 text-violet-600",
  slate: "bg-slate-100 text-slate-500",
};

const RISK_BADGE_CLASSES = {
  high_risk: "bg-red-50 text-red-600",
  moderate_risk: "bg-amber-50 text-amber-600",
  low_risk: "bg-emerald-50 text-emerald-600",
};

// Pure display component — CarePlan.jsx owns fetching (it decides whether
// to call the by-patient-name or by-id dashboard API) and hands the result
// here as a plain prop, so this component never fetches on its own.
export default function CarePlanDashboard({ data }) {
  const navigate = useNavigate();

  if (!data) {
    return null;
  }

  const { progress, risk_overview, health_status_analysis } = data;

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progress.overall_percent}%` }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center">
          <h4 className="text-xs font-semibold text-gray-700 sm:hidden">Care Plan Progress</h4>
          <ProgressDonut
            started={progress.started}
            inProgress={progress.in_progress}
            complete={progress.complete}
            overallPercent={progress.overall_percent}
          />
          <ul className="flex flex-col gap-1.5 text-xs text-gray-600">
            {LEGEND_ITEMS.map((item) => (
              <li key={item.key} className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
                <span className="font-semibold text-gray-800">
                  {item.key === "total_parameters" ? progress.total_parameters : progress[item.key]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="mb-3 text-xs font-semibold text-gray-700">Risk Overview</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {RISK_CARDS.map((riskCard) => {
              const { key, icon: Icon, tone } = riskCard;
              const card = risk_overview[key];
              return (
                <div key={key} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${TONE_CLASSES[tone]}`}>
                    <Icon size={16} />
                  </span>
                  <p className="text-lg font-bold text-gray-800">{card.count}</p>
                  <p className="text-[11px] font-medium leading-tight text-gray-600">{card.label}</p>
                  <p className="text-[10px] leading-tight text-gray-400">{card.footer}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <h4 className="border-b border-gray-100 px-4 py-3 text-xs font-semibold text-gray-700">Health Status Analysis</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="px-4 py-2 font-medium">Condition/Diagnosis</th>
                <th className="px-4 py-2 font-medium">Metric Type</th>
                <th className="px-4 py-2 font-medium">Last visit/record</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Status/risk level</th>
                <th className="px-4 py-2 font-medium">Progress</th>
                <th className="px-4 py-2 font-medium">Recommended Actions</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {health_status_analysis.map((row) => (
                <tr key={row.section_index} className="border-b border-gray-50 align-top text-gray-700 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{row.condition}</p>
                    {row.description && <p className="text-[11px] text-gray-400">{row.description}</p>}
                  </td>
                  <td className="px-4 py-3">{row.metric_type}</td>
                  <td className="px-4 py-3">{row.last_visit_record}</td>
                  <td className="px-4 py-3">{row.source}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${RISK_BADGE_CLASSES[row.risk_level]}`}
                    >
                      {row.risk_label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${row.progress_percent}%` }} />
                      </div>
                      <span>{row.progress_percent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.recommended_actions}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(`view?section=${row.section_index}`)}
                      className="font-medium text-emerald-600 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
