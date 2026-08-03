import { Users, ClipboardList, AlertOctagon, AlertTriangle, BedDouble, FileUp } from "lucide-react";
import StatCard from "./StatCard";

// Facility-level overview. Stats are placeholders until wired to real counts
// in a later phase (getPatients, alerts SSE, uploads, etc.).
const STATS = [
  { icon: Users, value: 42, label: "Patients", accent: "text-emerald-600", iconBg: "bg-emerald-50" },
  { icon: ClipboardList, value: 42, label: "Pending Plans", accent: "text-teal-600", iconBg: "bg-teal-50" },
  { icon: AlertOctagon, value: 14, label: "Critical Alerts", accent: "text-red-600", iconBg: "bg-red-50" },
  { icon: AlertTriangle, value: 3, label: "Alerts", accent: "text-pink-600", iconBg: "bg-pink-50" },
  { icon: BedDouble, value: 40, label: "Beds Available", accent: "text-indigo-600", iconBg: "bg-indigo-50" },
  { icon: FileUp, value: 12, label: "Uploads", accent: "text-amber-600", iconBg: "bg-amber-50" },
];

export default function Dashboard() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}
