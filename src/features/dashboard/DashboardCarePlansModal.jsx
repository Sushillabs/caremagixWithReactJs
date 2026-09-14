import { X, ClipboardList } from "lucide-react";
import useMyQuery from "../../hooks/useMyQuery";
import { getDashboardActiveCarePlans } from "../../api/hospitalApi";

export default function DashboardCarePlansModal({ onClose, isCaregiver, patients, openDetail, myRecord }) {
  const { data, isLoading, isError } = useMyQuery({ api: getDashboardActiveCarePlans, id: "dashboardActiveCarePlans", staleTime: 30 * 1000 });
  const plans = data?.active_care_plans || [];

  const handleOpen = (plan) => {
    if (isCaregiver) {
      const match = patients.find((p) => p.name?.toLowerCase() === plan.patient_name?.toLowerCase());
      if (!match) return;
      openDetail(match, { carePlanId: plan.care_plan_id });
    } else if (myRecord) {
      openDetail(myRecord, { carePlanId: plan.care_plan_id });
    }
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="flex max-h-[80vh] w-[640px] flex-col rounded-2xl bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-800">Active Care Plans</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
          {isError && <p className="text-sm text-red-600">Couldn't load care plans.</p>}

          {!isLoading && !isError && plans.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <ClipboardList size={28} className="text-gray-200" />
              <p className="text-xs text-gray-400">No active care plans.</p>
            </div>
          )}

          {!isLoading && !isError && plans.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {plans.map((plan) => (
                <li key={plan.care_plan_id}>
                  <button
                    type="button"
                    onClick={() => handleOpen(plan)}
                    className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-sm hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium capitalize text-gray-800">{plan.patient_name}</p>
                      <p className="truncate text-xs text-gray-500">
                        {plan.diagnosis} — {plan.label}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {plan.overall_percent}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
