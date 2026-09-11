import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTcmPatient, cancelTcmPlan } from "../../api/hospitalApi";
import { StatusPill, TriggerNote, VisitRow, formatDate, resolveVisits } from "./tcmFormat";
import TcmScheduleModal from "./TcmScheduleModal";

export default function TcmPatientDetail({ patientKey }) {
  const queryClient = useQueryClient();
  const [scheduling, setScheduling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tcm-patient", patientKey],
    queryFn: () => getTcmPatient(patientKey),
    enabled: !!patientKey,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.plan?.status;
      return ["pending_discharge_date", "pending_physician", "ready"].includes(status) ? 15000 : false;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (planId) => cancelTcmPlan(planId),
    onSuccess: () => {
      setCancelError(null);
      queryClient.invalidateQueries({ queryKey: ["tcm-patients"] });
      queryClient.invalidateQueries({ queryKey: ["tcm-patient", patientKey] });
    },
    onError: (err) => setCancelError(err?.response?.data?.message || err?.message || "Could not cancel TCM visits."),
  });

  if (!patientKey) return null;
  if (isLoading) return <p className="text-sm text-gray-400">Loading...</p>;
  if (isError) {
    return <p className="text-sm text-red-600">{error?.response?.data?.message || error?.message || "Failed to load TCM plan."}</p>;
  }

  const patient = data?.data;
  if (!patient) return null;

  const actions = patient.actions || {};
  const visits = resolveVisits(patient);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">{patient.patient_display_name}</p>
          <p className="text-xs text-gray-500">
            Discharge {formatDate(patient.discharge_date)} · {patient.physician_name || "No physician linked"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <StatusPill status={patient.plan?.status} />
          <TriggerNote plan={patient.plan} />
        </div>
      </div>

      {visits.length === 0 ? (
        <p className="text-xs text-gray-400">No TCM visits yet — set a discharge date to see proposed visit dates.</p>
      ) : (
        <div className="space-y-1.5">
          {visits.map((visit) => (
            <VisitRow key={visit.id} visit={visit} />
          ))}
        </div>
      )}

      {cancelError && <p className="text-xs text-red-600">{cancelError}</p>}

      {actions.show_manual_button && (
        <button
          type="button"
          onClick={() => setScheduling(true)}
          className="w-full rounded-lg bg-emerald-800 px-4 py-2 text-sm text-white hover:bg-emerald-900"
        >
          Schedule TCM visits
        </button>
      )}

      {actions.can_cancel && (
        <button
          type="button"
          onClick={() => cancelMutation.mutate(patient.plan.id)}
          disabled={cancelMutation.isPending}
          className="w-full rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cancelMutation.isPending ? "Cancelling..." : "Cancel remaining visits"}
        </button>
      )}

      {scheduling && (
        <TcmScheduleModal
          patientKey={patientKey}
          onClose={() => {
            setScheduling(false);
            queryClient.invalidateQueries({ queryKey: ["tcm-patient", patientKey] });
          }}
        />
      )}
    </div>
  );
}
