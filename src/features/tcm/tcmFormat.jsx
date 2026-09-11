export const STATUS_PILL = {
  pending_discharge_date: "bg-amber-100 text-amber-700",
  pending_physician: "bg-amber-100 text-amber-700",
  ready: "bg-blue-100 text-blue-700",
  scheduled: "bg-emerald-100 text-emerald-700",
  partial: "bg-orange-100 text-orange-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export const STATUS_LABEL = {
  pending_discharge_date: "Needs discharge date",
  pending_physician: "Needs physician",
  ready: "Ready to schedule",
  scheduled: "Scheduled",
  partial: "Partially scheduled",
  failed: "Failed",
  cancelled: "Cancelled",
};

export function StatusPill({ status }) {
  const key = status || "pending_discharge_date";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_PILL[key] || "bg-gray-100 text-gray-500"}`}>
      {STATUS_LABEL[key] || key}
    </span>
  );
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

const VISIT_PILL = {
  pending: "bg-gray-100 text-gray-500",
  booked: "bg-emerald-100 text-emerald-700",
  skipped: "bg-gray-100 text-gray-500",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-400",
};

export const VISIT_LABEL = {
  pending: "Pending",
  booked: "Booked",
  skipped: "Passed (not booked)",
  failed: "No open slot",
  cancelled: "Cancelled",
};

export function resolveVisits(card) {
  if (card?.plan?.visits?.length) return card.plan.visits;
  return (card?.proposed_visits || []).map((v) => ({
    id: v.offset_days,
    offset_days: v.offset_days,
    label: v.label,
    status: "pending",
    target_date: v.target_date,
  }));
}

export function VisitMiniChips({ visits }) {
  if (!visits?.length) return <span className="text-xs text-gray-400">—</span>;
  return (
    <div className="flex gap-1">
      {visits.map((visit) => {
        const detail = visit.status === "booked" ? formatDateTime(visit.appointment_datetime) : visit.detail || formatDate(visit.target_date);
        return (
          <span
            key={visit.id}
            title={`${visit.label}: ${VISIT_LABEL[visit.status] || visit.status} — ${detail}`}
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${VISIT_PILL[visit.status] || "bg-gray-100 text-gray-500"}`}
          >
            {visit.offset_days ? `D${visit.offset_days}` : visit.label}
          </span>
        );
      })}
    </div>
  );
}

export function TriggerNote({ plan }) {
  if (!plan || !["scheduled", "partial"].includes(plan.status)) return null;
  return (
    <span className="text-[10px] text-gray-400">{plan.trigger_source === "auto" ? "Scheduled automatically" : "Manually scheduled"}</span>
  );
}

export function VisitRow({ visit }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-3 py-2 text-xs">
      <div>
        <div className="font-medium text-gray-700">{visit.label}</div>
        <div className="text-gray-400">
          {visit.status === "booked" ? formatDateTime(visit.appointment_datetime) : visit.detail || formatDate(visit.target_date)}
        </div>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${VISIT_PILL[visit.status] || "bg-gray-100 text-gray-500"}`}>
        {VISIT_LABEL[visit.status] || visit.status}
      </span>
    </div>
  );
}
