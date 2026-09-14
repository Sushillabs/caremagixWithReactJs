export const STATUS_PILL = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-blue-100 text-blue-700",
};

export const APPOINTMENT_TYPE_LABEL = {
  follow_up: "Follow-up",
  new_visit: "New visit",
  telehealth: "Telehealth",
  urgent: "Urgent",
};

export function StatusPill({ status }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_PILL[status] || "bg-gray-100 text-gray-500"}`}>
      {status || "unknown"}
    </span>
  );
}

export function formatDateTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
