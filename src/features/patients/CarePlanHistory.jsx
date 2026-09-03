import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
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
          <ul className="divide-y divide-gray-100">
            {plans.map((plan) => (
              <li key={plan.care_plan_id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-800">
                    {plan.label || formatDate(plan.generated_at)}
                    {plan.is_active && (
                      <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                        Active
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    Version {plan.version} &nbsp;·&nbsp; {plan.overall_percent}% complete
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/app/patients/${id}/care-plan/view?care_plan_id=${plan.care_plan_id}`)}
                  className="rounded-md border border-emerald-200 px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
