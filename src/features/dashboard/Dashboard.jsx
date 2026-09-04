import { Users, ClipboardList, AlertTriangle, BedDouble, FileUp, CalendarCheck, HeartPulse, FileText } from "lucide-react";
import StatCard from "./StatCard";
import usePatientRecords from "../../hooks/usePatientRecords";
import useOpenPatientDetail from "../../hooks/useOpenPatientDetail";
import useMyQuery from "../../hooks/useMyQuery";
import { getDashboardStats } from "../../api/hospitalApi";

// One entry per possible backend field (see caremagix-be/dashboard/service.py).
// Same icon/color language as the old static cards — only icon+label+color
// live here, the count always comes from the API response. A field the
// backend doesn't send for this role just never turns into a card.
const CARD_DEFS = {
  patient_count: { icon: Users, label: "Patients", accent: "text-emerald-600", iconBg: "bg-emerald-50" },
  active_careplan_count: { icon: ClipboardList, label: "Active Care Plans", accent: "text-teal-600", iconBg: "bg-teal-50" },
  medication_alert_count: { icon: AlertTriangle, label: "Medication Alerts", accent: "text-pink-600", iconBg: "bg-pink-50" },
  beds_available: { icon: BedDouble, label: "Beds Available", accent: "text-indigo-600", iconBg: "bg-indigo-50" },
  uploaded_document_count: { icon: FileUp, label: "Uploads", accent: "text-amber-600", iconBg: "bg-amber-50" },
  upcoming_appointment_count: { icon: CalendarCheck, label: "Upcoming Appointments", accent: "text-teal-600", iconBg: "bg-teal-50" },
  appointment_count: { icon: CalendarCheck, label: "Your Appointments", accent: "text-teal-600", iconBg: "bg-teal-50" },
  wellness_check_in_streak_days: { icon: HeartPulse, label: "Wellness Check-in Streak", accent: "text-rose-600", iconBg: "bg-rose-50" },
  document_count: { icon: FileText, label: "Documents", accent: "text-amber-600", iconBg: "bg-amber-50" },
};

// Payload keys that describe context (role tag, org name), not a stat card.
const NON_CARD_FIELDS = new Set(["view", "facility_name", "hospital_name"]);

// Patient role has no roster to browse — they are the one record. Backend
// already scopes getPatients() to just them, so instead of a separate list
// page, this button opens their own detail via the same navigation flow
// PatientsList uses for everyone else.
function PatientViewDetailsButton() {
  const patients = usePatientRecords();
  const openDetail = useOpenPatientDetail();
  const myRecord = patients?.[0];

  return (
    <div className="mb-4 flex justify-end">
      <button
        type="button"
        disabled={!myRecord}
        onClick={() => myRecord && openDetail(myRecord)}
        className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        View Details
      </button>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError } = useMyQuery({
    api: getDashboardStats,
    id: "dashboardStats",
    staleTime: 60 * 1000,
  });

  const isPatient = data?.view === "patient";
  const orgName = data?.facility_name || data?.hospital_name;

  // Cards are driven entirely by whichever fields the backend actually sent —
  // no client-side guessing at counts the current role's payload lacks.
  const cards = data
    ? Object.entries(data)
        .filter(([key, value]) => !NON_CARD_FIELDS.has(key) && CARD_DEFS[key] && typeof value === "number")
        .map(([key, value]) => ({ ...CARD_DEFS[key], key, value }))
    : [];

  return (
    <div>
      {orgName && <div className="mb-3 text-sm font-medium text-gray-600">{orgName}</div>}
      {isPatient && <PatientViewDetailsButton />}

      {isLoading && <div className="text-sm text-gray-500">Loading dashboard…</div>}
      {isError && <div className="text-sm text-red-600">Couldn't load dashboard stats.</div>}

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {cards.map((c) => (
            <StatCard key={c.key} {...c} />
          ))}
        </div>
      )}
    </div>
  );
}
