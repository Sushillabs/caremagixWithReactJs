import { useNavigate, useOutletContext } from "react-router-dom";
import { Users, ClipboardList, AlertTriangle, BedDouble, FileUp, CalendarCheck, HeartPulse, FileText } from "lucide-react";
import StatCard from "./StatCard";
import usePatientRecords from "../../hooks/usePatientRecords";
import useOpenPatientDetail from "../../hooks/useOpenPatientDetail";
import useMyQuery from "../../hooks/useMyQuery";
import { getDashboardStats } from "../../api/hospitalApi";

// Patient/POA cards with a real, specific destination — everything else
// (Active Care Plans, Documents) has no dedicated view to land on, so it
// stays a plain non-interactive tile, same rule as the caregiver-side cards.
// See useOpenPatientDetail's optional {panel, tab}.
const PATIENT_OWN_RECORD_CARDS = {
  appointment_count: { panel: "appointments", tab: "myAppointments" },
  wellness_check_in_streak_days: { panel: "wellness", tab: "trends" },
};

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

const NON_CARD_FIELDS = new Set(["view", "facility_name", "hospital_name"]);

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
  const navigate = useNavigate();
  // Set by AppShell — same open-the-notification-panel action the bell icon
  // in TopBar uses, so Medication Alerts opens that identical panel in place.
  const { openNotifications } = useOutletContext() || {};
  const { data, isLoading, isError } = useMyQuery({
    api: getDashboardStats,
    id: "dashboardStats",
    staleTime: 60 * 1000,
  });

  const isPatient = data?.view === "patient";
  const orgName = data?.facility_name || data?.hospital_name;

  // Same "open my own record" action as PatientViewDetailsButton below —
  // usePatientRecords caches under the same query key, so this doesn't
  // trigger a second fetch.
  const patients = usePatientRecords();
  const openDetail = useOpenPatientDetail();
  const myRecord = patients?.[0];

  // Only fields with a real destination today get a click handler — the
  // rest stay plain display tiles (see StatCard's onClick-optional render).
  const cardActions = {};
  if (data?.view === "caregiver" || data?.view === "physician") {
    cardActions.patient_count = () => navigate("/app/patients");
  }
  if (data?.view === "caregiver" && openNotifications) {
    cardActions.medication_alert_count = () => openNotifications();
  }
  if (data?.view === "physician") {
    cardActions.upcoming_appointment_count = () => navigate("/app/manage-bookings");
  }
  if (isPatient && myRecord) {
    Object.entries(PATIENT_OWN_RECORD_CARDS).forEach(([key, dest]) => {
      cardActions[key] = () => openDetail(myRecord, dest);
    });
  }

  // Cards are driven entirely by whichever fields the backend actually sent —
  // no client-side guessing at counts the current role's payload lacks.
  const cards = data
    ? Object.entries(data)
        .filter(([key, value]) => !NON_CARD_FIELDS.has(key) && CARD_DEFS[key] && typeof value === "number")
        .map(([key, value]) => ({ ...CARD_DEFS[key], key, value, onClick: cardActions[key] }))
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
