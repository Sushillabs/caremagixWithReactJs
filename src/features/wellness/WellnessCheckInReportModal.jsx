import { HeartPulse, X } from "lucide-react";

// Static placeholder data, shaped like the real GET /hf-wellness/caregiver/dashboard
// + /check-ins response so wiring the real API later is a drop-in swap for
// this object — no rendering changes needed.
const STATIC_REPORT = {
  recent_check_ins: [
    {
      id: 1,
      check_in_date: "Aug 21, 2026",
      weight_lb: 158.7,
      weight_delta_1d_lb: 4.4,
      zone: "yellow",
      zone_reasons: [
        { zone: "yellow", label: "Weight up 4.4 lb since yesterday" },
        { zone: "yellow", label: "Weight up 26.7 lb over the past week" },
      ],
    },
    {
      id: 2,
      check_in_date: "Aug 20, 2026",
      weight_lb: 154.3,
      weight_delta_1d_lb: null,
      zone: "yellow",
      zone_reasons: [{ zone: "yellow", label: "Weight up 22.3 lb over the past week" }],
    },
    { id: 3, check_in_date: "Aug 17, 2026", weight_lb: null, weight_delta_1d_lb: null, zone: "green", zone_reasons: [] },
    { id: 4, check_in_date: "Aug 16, 2026", weight_lb: null, weight_delta_1d_lb: null, zone: "green", zone_reasons: [] },
    { id: 5, check_in_date: "Aug 14, 2026", weight_lb: 132, weight_delta_1d_lb: -30, zone: "green", zone_reasons: [] },
    {
      id: 6,
      check_in_date: "Aug 12, 2026",
      weight_lb: 162,
      weight_delta_1d_lb: null,
      zone: "yellow",
      medications_taken: false,
      zone_reasons: [{ zone: "yellow", label: "Heart medicines were missed" }],
    },
  ],
  care_plan: {
    dry_weight_lb: null,
    daily_fluid_limit_ml: 2000,
    daily_sodium_limit_mg: 2000,
    nyha_class: null,
    preferred_check_in_time: null,
  },
};

const ZONE_PILL = {
  green: "bg-emerald-100 text-emerald-700",
  yellow: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

function ZonePill({ zone }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${ZONE_PILL[zone] || "bg-gray-100 text-gray-500"}`}>{zone}</span>;
}

function CarePlanTile({ label, value }) {
  return (
    <div className="rounded-md border border-gray-100 bg-gray-50 p-2 text-center">
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-gray-800">{value ?? "Not set"}</div>
    </div>
  );
}

export default function WellnessCheckInReportModal({ onClose, report = STATIC_REPORT }) {
  const { recent_check_ins: checkIns, care_plan: carePlan } = report;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex max-h-[85vh] w-[640px] max-w-[90vw] flex-col rounded-2xl bg-white shadow-lg">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <HeartPulse size={16} className="text-emerald-600" />
            Wellness Check-in
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          <div>
            <h3 className="mb-2 text-xs font-semibold text-gray-600">Recent check-ins</h3>
            <div className="space-y-1.5">
              {checkIns.map((checkIn) => {
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

          <div>
            <h3 className="mb-2 text-xs font-semibold text-gray-600">Care plan</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <CarePlanTile label="Target (dry) weight" value={carePlan.dry_weight_lb ? `${carePlan.dry_weight_lb} lb` : null} />
              <CarePlanTile label="Daily fluid limit" value={carePlan.daily_fluid_limit_ml ? `${carePlan.daily_fluid_limit_ml} ml` : null} />
              <CarePlanTile label="Daily sodium limit" value={carePlan.daily_sodium_limit_mg ? `${carePlan.daily_sodium_limit_mg} mg` : null} />
              <CarePlanTile label="NYHA class" value={carePlan.nyha_class} />
              <CarePlanTile label="Preferred check-in time" value={carePlan.preferred_check_in_time} />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            This wellness chat supports your heart failure self-care. It does not replace advice from your doctor or nurse, and it cannot diagnose
            problems or change your medicines.
          </p>
        </div>
      </div>
    </div>
  );
}
