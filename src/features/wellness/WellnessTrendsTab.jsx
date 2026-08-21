import WeightTrendChart from "./WeightTrendChart";

const ZONE_PILL = {
  green: "bg-emerald-100 text-emerald-700",
  yellow: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  unknown: "bg-gray-100 text-gray-500",
};

function ZonePill({ zone }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${ZONE_PILL[zone] || ZONE_PILL.unknown}`}>{zone || "unknown"}</span>;
}

// Matches legacy's renderStats/renderWeightChart/renderCheckInList (all fed
// by one GET /hf-wellness/dashboard call) — 4 stat tiles, the weight trend,
// then a check-in list with per-row yellow/red reasons.
export default function WellnessTrendsTab({ dashboard, loading, error }) {
  if (loading) return <p className="p-4 text-sm text-gray-400">Loading your trends...</p>;
  if (error) return <p className="p-4 text-sm text-red-600">Error: {error}</p>;
  if (!dashboard) return null;

  const { current_zone, check_in_streak_days, latest_check_in, adherence, weight_series, recent_check_ins } = dashboard;

  const tiles = [
    { label: "Today's zone", value: <ZonePill zone={current_zone} /> },
    { label: "Check-in streak", value: `${check_in_streak_days || 0} days` },
    { label: "Last weight", value: latest_check_in?.weight_lb ? `${latest_check_in.weight_lb} lb` : "—" },
    { label: "Medicines taken", value: adherence?.adherence_percent == null ? "—" : `${adherence.adherence_percent}%` },
  ];

  return (
    <div className="space-y-3 p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-md border border-gray-100 bg-gray-50 p-2 text-center">
            <div className="text-[10px] text-gray-500">{tile.label}</div>
            <div className="mt-1 text-sm font-semibold text-gray-800">{tile.value}</div>
          </div>
        ))}
      </div>

      <WeightTrendChart series={weight_series} />

      <div className="space-y-1.5">
        {(recent_check_ins || []).length === 0 && <p className="text-xs text-gray-400">No check-ins recorded yet.</p>}
        {(recent_check_ins || []).map((checkIn) => {
          const details = [];
          if (checkIn.weight_lb) details.push(`${checkIn.weight_lb} lb`);
          if (checkIn.weight_delta_1d_lb != null) {
            details.push(`${checkIn.weight_delta_1d_lb > 0 ? "+" : ""}${checkIn.weight_delta_1d_lb} lb vs prior`);
          }
          if (checkIn.medications_taken === false) details.push("missed medicines");

          const reasons = (checkIn.zone_reasons || [])
            .filter((r) => r.zone === "yellow" || r.zone === "red")
            .map((r) => r.label)
            .slice(0, 3)
            .join("; ");

          return (
            <div key={checkIn.id} className="flex items-center justify-between rounded-md border border-gray-100 p-2 text-xs">
              <div>
                <div className="text-gray-700">{checkIn.check_in_date}</div>
                <div className="text-gray-400">{details.join(" · ") || "No values recorded"}</div>
                {reasons && <div className="text-amber-600">{reasons}</div>}
              </div>
              <ZonePill zone={checkIn.zone} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
