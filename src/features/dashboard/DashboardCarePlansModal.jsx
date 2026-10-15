import { useEffect } from "react";
import { X, ClipboardList } from "lucide-react";
import useMyQuery from "../../hooks/useMyQuery";
import { getDashboardActiveCarePlans } from "../../api/hospitalApi";

export default function DashboardCarePlansModal({ onClose, isCaregiver, patients, openDetail, myRecord }) {
  const { data, isLoading, isError } = useMyQuery({ api: getDashboardActiveCarePlans, id: "dashboardActiveCarePlans", staleTime: 30 * 1000 });
  const plans = data?.active_care_plans || [];

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white pb-safe shadow-lg sm:max-h-[80vh] sm:w-[640px] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray-300 sm:hidden" />
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-2 sm:p-4">
          <h2 className="flex-1 text-base font-semibold text-gray-800 sm:text-sm">Active Care Plans</h2>
          {plans.length > 0 && <span className="text-xs text-gray-500 sm:hidden">{plans.length} plans</span>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 sm:h-auto sm:w-auto sm:p-1"
          >
            <X size={16} className="size-5 text-gray-500 sm:size-4" />
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
                    className="flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left text-sm active:bg-gray-50 sm:min-h-0 sm:py-2.5 sm:hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="break-words font-medium capitalize text-gray-800 sm:truncate">{plan.patient_name}</p>
                      <p className="mt-0.5 break-words text-xs text-gray-500 max-sm:line-clamp-2 sm:mt-0 sm:truncate">
                        {plan.diagnosis} — {plan.label}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700 sm:px-2 sm:py-0.5 sm:text-xs">
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
