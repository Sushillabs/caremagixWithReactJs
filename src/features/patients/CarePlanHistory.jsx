import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Layers, AlertTriangle } from "lucide-react";
import { getCarePlans } from "../../api/hospitalApi";
import { getPatientKey, getCarePlanLookupName } from "../../utils/buildPatientPayload";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function CarePlanHistory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patientKey = getPatientKey(singleData?.patient_name, singleData?.patient_type);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["care-plans", patientKey],
    queryFn: () =>
      getCarePlans(getCarePlanLookupName(singleData?.patient_name, singleData?.patient_type), singleData?.patient_type),
    enabled: !!singleData?.patient_name,
  });

  const plans = data?.care_plans || [];

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 p-2">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
          <ArrowLeft size={14} /> Back
        </button>
        <h3 className="text-xs font-bold text-gray-800">Care Plan History</h3>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="p-4 text-sm text-gray-400">Loading plan history...</p>
        ) : isError ? (
          <p className="p-4 text-sm text-red-600">Could not load plan history.</p>
        ) : plans.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">No care plans generated yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.care_plan_id}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">{plan.label || formatDate(plan.generated_at)}</p>
                    <p className="text-xs text-gray-400">Version {plan.version}</p>
                  </div>
                  {plan.is_active && (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Active</span>
                  )}
                </div>

                {plan.diagnosis && <p className="line-clamp-2 text-xs text-gray-500">{plan.diagnosis}</p>}

                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-gray-500">
                    <span>Progress</span>
                    <span className="font-medium text-gray-700">{plan.overall_percent}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${plan.overall_percent}%` }} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Layers size={12} className="text-gray-400" /> {plan.section_count} sections
                  </span>
                  {plan.high_risk_count > 0 && (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertTriangle size={12} /> {plan.high_risk_count} high risk
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-[11px] text-gray-400">Updated {formatDate(plan.updated_at)}</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/app/patients/${id}/care-plan/view?care_plan_id=${plan.care_plan_id}`)}
                    className="rounded-md border border-emerald-200 px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
