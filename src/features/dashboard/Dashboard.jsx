import { useSelector } from "react-redux";
import { Users, ClipboardList, AlertOctagon, AlertTriangle, BedDouble, FileUp, CalendarCheck, Bell, Pill, HeartPulse, FileText } from "lucide-react";
import StatCard from "./StatCard";
import usePatientRecords from "../../hooks/usePatientRecords";
import useOpenPatientDetail from "../../hooks/useOpenPatientDetail";

const STATS = [
  { icon: Users, value: 19, label: "Patients", accent: "text-emerald-600", iconBg: "bg-emerald-50" },
  { icon: ClipboardList, value: 42, label: "Pending Plans", accent: "text-teal-600", iconBg: "bg-teal-50" },
  { icon: AlertOctagon, value: 14, label: "Critical Alerts", accent: "text-red-600", iconBg: "bg-red-50" },
  { icon: AlertTriangle, value: 3, label: "Alerts", accent: "text-pink-600", iconBg: "bg-pink-50" },
  { icon: BedDouble, value: 148, label: "Beds Available", accent: "text-indigo-600", iconBg: "bg-indigo-50" },
  { icon: FileUp, value: 10, label: "Uploads", accent: "text-amber-600", iconBg: "bg-amber-50" },
];

const PATIENT_STATS = [
  { icon: ClipboardList, value: 1, label: "Your Plan", accent: "text-emerald-600", iconBg: "bg-emerald-50" },
  { icon: CalendarCheck, value: 2, label: "Your Appointments", accent: "text-teal-600", iconBg: "bg-teal-50" },
  { icon: Bell, value: 3, label: "Alerts", accent: "text-pink-600", iconBg: "bg-pink-50" },
  { icon: Pill, value: 4, label: "Medications", accent: "text-indigo-600", iconBg: "bg-indigo-50" },
  { icon: HeartPulse, value: 2, label: "Wellness Check-ins", accent: "text-rose-600", iconBg: "bg-rose-50" },
  { icon: FileText, value: 5, label: "Documents", accent: "text-amber-600", iconBg: "bg-amber-50" },
];

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
  const role = useSelector((state) => state.auth?.value?.role) || "caregiver";
  const isPatient = role === "patient";
  const cards = isPatient ? PATIENT_STATS : STATS;

  return (
    <div>
      {isPatient && <PatientViewDetailsButton />}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}
