import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTcmPatients, cancelTcmPlan } from "../../api/hospitalApi";
import { StatusPill, TriggerNote, VisitMiniChips, VisitRow, formatDate, resolveVisits } from "./tcmFormat";
import TcmScheduleModal from "./TcmScheduleModal";

export default function TcmListPage() {
  const { search } = useOutletContext() || {};
  const queryClient = useQueryClient();
  const [schedulingKey, setSchedulingKey] = useState(null);
  const [cancelError, setCancelError] = useState(null);
  const [confirmCancelKey, setConfirmCancelKey] = useState(null);
  const [lastActionKey, setLastActionKey] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tcm-patients"],
    queryFn: () => getTcmPatients(),
    refetchInterval: (query) => {
      const rows = query.state.data?.data?.items || [];
      const stillPending = rows.some((r) =>
        ["pending_discharge_date", "pending_physician", "ready"].includes(r.plan?.status)
      );
      return stillPending ? 15000 : false;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (planId) => cancelTcmPlan(planId),
    onSuccess: () => {
      setCancelError(null);
      queryClient.invalidateQueries({ queryKey: ["tcm-patients"] });
    },
    onError: (err) => setCancelError(err?.response?.data?.message || err?.message || "Could not cancel TCM visits."),
  });

  const items = useMemo(() => {
    const rows = data?.data?.items || [];
    const q = (search || "").trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.patient_display_name?.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-3">
        <h2 className="text-sm font-semibold text-gray-800">Transitional care visits</h2>
      </div>

      {cancelError && <p className="hidden border-b border-gray-100 px-4 py-2 text-xs text-red-600 md:block">{cancelError}</p>}

      <ul className="divide-y divide-gray-100 md:hidden">
        {isLoading && <li className="px-4 py-6 text-center text-sm text-gray-400">Loading...</li>}
        {isError && !isLoading && (
          <li className="px-4 py-6 text-center text-sm text-red-600">
            {error?.response?.data?.message || error?.message || "Failed to load TCM patients."}
          </li>
        )}
        {!isLoading && !isError && items.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-gray-500">No patients need TCM scheduling right now.</li>
        )}
        {items.map((row) => {
          const isCancelling = cancelMutation.isPending && cancelMutation.variables === row.plan?.id;
          return (
            <li key={row.patient_key} className="space-y-1.5 px-4 py-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 break-words font-medium text-gray-800">{row.patient_display_name || row.patient_key}</p>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <StatusPill status={row.plan?.status} />
                  <TriggerNote plan={row.plan} />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Discharge {formatDate(row.discharge_date)} · {row.physician_name || "No physician"}
              </p>
              {resolveVisits(row).length > 0 ? (
                <div className="space-y-1.5">
                  {resolveVisits(row).map((visit) => (
                    <VisitRow key={visit.id} visit={visit} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No TCM visits yet.</p>
              )}
              {confirmCancelKey === row.patient_key ? (
                <div className="mt-1 space-y-2 rounded-md border border-red-200 bg-red-50 p-2.5">
                  <p className="text-sm text-red-800">Cancel the remaining TCM visits for this patient?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLastActionKey(row.patient_key);
                        setConfirmCancelKey(null);
                        cancelMutation.mutate(row.plan.id);
                      }}
                      className="flex-1 rounded-md bg-red-600 py-2 text-white"
                    >
                      Yes, cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmCancelKey(null)}
                      className="flex-1 rounded-md border border-gray-300 bg-white py-2 text-gray-700"
                    >
                      Keep
                    </button>
                  </div>
                </div>
              ) : (
                (row.actions?.show_manual_button || row.actions?.can_cancel) && (
                  <div className="space-y-2 pt-1">
                    {row.actions?.show_manual_button && (
                      <button
                        type="button"
                        onClick={() => setSchedulingKey(row.patient_key)}
                        className="w-full rounded-md bg-emerald-700 py-2 text-white"
                      >
                        Schedule TCM visits
                      </button>
                    )}
                    {row.actions?.can_cancel && (
                      <button
                        type="button"
                        onClick={() => setConfirmCancelKey(row.patient_key)}
                        disabled={isCancelling}
                        className="w-full rounded-md border border-red-200 py-2 text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isCancelling ? "Cancelling..." : "Cancel TCM visits"}
                      </button>
                    )}
                  </div>
                )
              )}
              {cancelError && lastActionKey === row.patient_key && (
                <p role="alert" className="text-xs text-red-600">
                  {cancelError}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <table className="hidden w-full text-left text-sm md:table">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <th className="px-4 py-3 font-medium">Patient</th>
            <th className="px-4 py-3 font-medium">Discharge date</th>
            <th className="px-4 py-3 font-medium">Physician</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Visits</th>
            <th className="px-4 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                Loading...
              </td>
            </tr>
          )}
          {isError && !isLoading && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-red-600">
                {error?.response?.data?.message || error?.message || "Failed to load TCM patients."}
              </td>
            </tr>
          )}
          {!isLoading && !isError && items.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                No patients need TCM scheduling right now.
              </td>
            </tr>
          )}
          {items.map((row) => (
            <tr key={row.patient_key} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-700">{row.patient_display_name || row.patient_key}</td>
              <td className="px-4 py-3 text-gray-700">{formatDate(row.discharge_date)}</td>
              <td className="px-4 py-3 text-gray-700">{row.physician_name || "—"}</td>
              <td className="px-4 py-3">
                <div className="flex flex-col items-start gap-0.5">
                  <StatusPill status={row.plan?.status} />
                  <TriggerNote plan={row.plan} />
                </div>
              </td>
              <td className="px-4 py-3">
                <VisitMiniChips visits={resolveVisits(row)} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  {row.actions?.show_manual_button && (
                    <button
                      type="button"
                      onClick={() => setSchedulingKey(row.patient_key)}
                      className="text-xs font-medium text-emerald-600 hover:underline"
                    >
                      Schedule TCM visits
                    </button>
                  )}
                  {row.actions?.can_cancel && (
                    <button
                      type="button"
                      onClick={() => cancelMutation.mutate(row.plan.id)}
                      disabled={cancelMutation.isPending && cancelMutation.variables === row.plan.id}
                      className="text-xs font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancelMutation.isPending && cancelMutation.variables === row.plan.id ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {schedulingKey && <TcmScheduleModal patientKey={schedulingKey} onClose={() => setSchedulingKey(null)} />}
    </div>
  );
}
