import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import useCarePlanStatus from "../../hooks/useCarePlanStatus";
import useCarePlan from "../../hooks/useCarePlan";
import { getPatientKey, getCarePlanLookupName } from "../../utils/buildPatientPayload";
import { getCarePlanDashboard, getCarePlanDashboardByPatient } from "../../api/hospitalApi";
import CarePlanDashboard from "./CarePlanDashboard";

function formatUpdatedAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function CarePlan() {
  const navigate = useNavigate();
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patientKey = getPatientKey(singleData?.patient_name, singleData?.patient_type);
  const { status, progress, carePlanId } = useCarePlanStatus(patientKey);
  const { generate, isStarting } = useCarePlan();

  // On page load: check the backend directly for an existing plan. This is
  // separate from useCarePlanStatus, which only knows about jobs tracked in
  // THIS browser session — a plan generated earlier (or by someone else)
  // would still show as "idle" without this check.
  const backendCheck = useQuery({
    queryKey: ["care-plan-dashboard-by-patient", patientKey],
    queryFn: () =>
      getCarePlanDashboardByPatient(
        getCarePlanLookupName(singleData?.patient_name, singleData?.patient_type),
        singleData?.patient_type
      ),
    enabled: !!singleData?.patient_name && status === "idle",
    retry: false,
  });
  const backendHasPlan = !backendCheck.isError && !!backendCheck.data;

  // Right after a fresh generation finishes this session, we already know
  // the exact care_plan_id from the job — fetch that one precisely instead
  // of searching by name again.
  const freshFetch = useQuery({
    queryKey: ["care-plan-dashboard-by-id", carePlanId],
    queryFn: () => getCarePlanDashboard(carePlanId),
    enabled: status === "done" && !!carePlanId,
  });

  // Redux status wins when it has an opinion (running/done/failed this
  // session); otherwise fall back to what the backend check found.
  const effectiveStatus = status !== "idle" ? status : backendHasPlan ? "done" : "idle";
  const dashboardData = status === "done" ? freshFetch.data : backendCheck.data;

  const handleClick = async () => {
    if (effectiveStatus === "idle") {
      await generate({
        patient_name: singleData?.patient_name,
        patient_type: singleData?.patient_type,
        doc_title: singleData?.dates || singleData?.patient_collection,
        regenerate: false,
      });
    }
    navigate("view");
  };

  const buttonLabel = isStarting
    ? "Starting..."
    : effectiveStatus === "running"
    ? `Generating... ${progress}%`
    : effectiveStatus === "done"
    ? "View Care Plan"
    : "Create Care Plan";

  const updatedAtLabel = formatUpdatedAt(dashboardData?.updated_at);

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-2 bg-[#F0FDF4] text-xs">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-gray-800">Care Plan</h3>
          {updatedAtLabel && <span className="text-[11px] text-gray-500">Last updated: {updatedAtLabel}</span>}
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={isStarting}
          className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-white hover:bg-emerald-700 disabled:opacity-70"
        >
          {buttonLabel}
        </button>
      </div>

      {effectiveStatus === "done" && dashboardData ? (
        <CarePlanDashboard data={dashboardData} /> // temporarily off, showing placeholder below
        // <div>Care Plan Dashboard</div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4 text-sm text-gray-400">
          {effectiveStatus === "running"
            ? "Dashboard will be available once generation finishes."
            : effectiveStatus === "failed"
            ? "Care plan generation failed — dashboard unavailable."
            : backendCheck.isLoading
            ? "Checking for an existing care plan..."
            : "Generate a care plan to see the dashboard."}
        </div>
      )}
    </div>
  );
}
