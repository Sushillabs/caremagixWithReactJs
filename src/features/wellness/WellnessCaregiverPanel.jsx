import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import WellnessTrendsTab from "./WellnessTrendsTab";
import WellnessPlanTab from "./WellnessPlanTab";
import WellnessQuestionEditor from "./WellnessQuestionEditor";
import { getWellnessCaregiverDashboard } from "../../api/hospitalApi";

const TABS = [
  { key: "trends", label: "Progress" },
  // { key: "questions", label: "Check-in Questions" },
  // { key: "plan", label: "Plan" },
];

// Plan editing lives here instead of on the patient side now — but there's
// no backend route yet for a caregiver to update another user's profile
// (only PATCH /hf-wellness/profile, which always targets current_user).
// Stubbed until that route exists; WellnessPlanTab's own error UI surfaces
// this via its onSave catch.
async function saveNotYetSupported() {
  throw new Error("Saving isn't available yet — this will be wired up once the caregiver profile-update API exists.");
}

export default function WellnessCaregiverPanel() {
  const [activeTab, setActiveTab] = useState("trends");
  const { setAssistantHidden } = useOutletContext() || {};

  // Read-only report — hide the shared AiCareAssistant docked bar while it's
  // mounted, same as WellnessCheckInPanel/AppointmentsPanel (no chat/input
  // here at all, so the bar has nothing useful to do).
  useEffect(() => {
    setAssistantHidden?.(true);
    return () => setAssistantHidden?.(false);
  }, [setAssistantHidden]);

  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patientName = singleData?.patient?.name || singleData?.patient_name;

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientName) return;
    setLoading(true);
    getWellnessCaregiverDashboard(patientName)
      .then((data) => {
        setDashboard(data);
        setError(null);
      })
      .catch((err) => setError(err?.message || "Could not load this patient's wellness data"))
      .finally(() => setLoading(false));
  }, [patientName]);

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
      <div className="shrink-0 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-2 bg-[#F0FDF4]">
        <h3 className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
          <HeartPulse size={14} className="text-emerald-600" />
          Wellness Check-in{patientName ? ` — ${patientName}` : ""}
        </h3>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={activeTab === tab.key ? "font-medium text-emerald-600" : "text-gray-500 hover:text-gray-700"}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "trends" && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <WellnessTrendsTab dashboard={dashboard} loading={loading} error={error} />
        </div>
      )}

      {activeTab === "questions" && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <WellnessQuestionEditor patientName={patientName} />
        </div>
      )}

      {activeTab === "plan" && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-sm text-gray-400">Loading...</p>
          ) : error ? (
            <p className="p-4 text-sm text-red-600">Error: {error}</p>
          ) : (
            <WellnessPlanTab profile={dashboard?.profile} onSave={saveNotYetSupported} />
          )}
        </div>
      )}
    </div>
  );
}
