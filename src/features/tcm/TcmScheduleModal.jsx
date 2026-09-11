import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { getTcmPatient, getTcmPhysicians, scheduleTcmVisits } from "../../api/hospitalApi";
import { VisitRow } from "./tcmFormat";

export default function TcmScheduleModal({ patientKey, onClose }) {
  const queryClient = useQueryClient();
  const [dischargeDate, setDischargeDate] = useState("");
  const [physicianUserId, setPhysicianUserId] = useState("");
  const [formError, setFormError] = useState(null);
  const [result, setResult] = useState(null);

  const { data: patientRes, isLoading, isError, error } = useQuery({
    queryKey: ["tcm-patient", patientKey],
    queryFn: () => getTcmPatient(patientKey),
  });

  const patient = patientRes?.data;
  const actions = patient?.actions || {};

  useEffect(() => {
    if (patient?.discharge_date) setDischargeDate(patient.discharge_date);
    if (patient?.physician_user_id) setPhysicianUserId(patient.physician_user_id);
  }, [patient?.discharge_date, patient?.physician_user_id]);

  const physiciansQuery = useQuery({
    queryKey: ["tcm-physicians", patientKey],
    queryFn: () => getTcmPhysicians(patientKey),
    enabled: !!actions.physician_selection_required,
  });

  const scheduleMutation = useMutation({
    mutationFn: (payload) => scheduleTcmVisits(payload),
    onSuccess: (res) => {
      setFormError(null);
      setResult(res?.data);
      queryClient.invalidateQueries({ queryKey: ["tcm-patients"] });
      queryClient.invalidateQueries({ queryKey: ["tcm-patient", patientKey] });
    },
    onError: (err) => setFormError(err?.response?.data?.message || err?.message || "Could not schedule TCM visits."),
  });

  const handleConfirm = () => {
    if (actions.physician_selection_required && !physicianUserId) {
      setFormError("Choose a physician to continue.");
      return;
    }
    setFormError(null);
    scheduleMutation.mutate({
      patient_key: patientKey,
      discharge_date: dischargeDate || undefined,
      physician_user_id: physicianUserId || undefined,
    });
  };

  const physicians = physiciansQuery.data?.data?.physicians || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[85vh] w-[480px] overflow-y-auto rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-emerald-700">Schedule TCM visits</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {isLoading && <p className="text-sm text-gray-400">Loading...</p>}
          {isError && (
            <p className="text-sm text-red-600">{error?.response?.data?.message || error?.message || "Failed to load patient."}</p>
          )}

          {!isLoading && !isError && patient && !result && (
            <>
              <p className="text-sm font-medium text-gray-700">{patient.patient_display_name}</p>

              {actions.discharge_date_required && (
                <div>
                  <label className="text-xs font-medium text-gray-700">Discharge date</label>
                  <input
                    type="date"
                    value={dischargeDate}
                    onChange={(e) => setDischargeDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Used to place visits 7, 14, and 30 days later. If unknown, visits are placed from today.
                  </p>
                </div>
              )}

              {actions.physician_selection_required ? (
                <div>
                  <label className="text-xs font-medium text-gray-700">Choose a physician (sorted by distance)</label>
                  {physiciansQuery.isLoading && <p className="mt-1 text-xs text-gray-400">Loading physicians...</p>}
                  {physiciansQuery.isError && <p className="mt-1 text-xs text-red-600">Failed to load physicians.</p>}
                  <div className="mt-1 max-h-48 space-y-1 overflow-y-auto">
                    {physicians.map((p) => (
                      <label
                        key={p.user_id}
                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs ${
                          physicianUserId === p.user_id ? "border-emerald-400 bg-emerald-50" : "border-gray-200"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input type="radio" checked={physicianUserId === p.user_id} onChange={() => setPhysicianUserId(p.user_id)} />
                          <span>
                            <span className="font-medium text-gray-700">{p.full_name}</span>
                            {p.is_matched && <span className="ml-1 text-emerald-600">(Assigned)</span>}
                            {p.hospital_name && <span className="block text-gray-400">{p.hospital_name}</span>}
                          </span>
                        </span>
                        {p.distance_label && <span className="shrink-0 text-gray-400">{p.distance_label}</span>}
                      </label>
                    ))}
                    {!physiciansQuery.isLoading && physicians.length === 0 && (
                      <p className="text-xs text-gray-400">No physicians available.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">Physician: {patient.physician_name}</p>
              )}

              {formError && <p className="text-xs text-red-600">{formError}</p>}

              <button
                type="button"
                onClick={handleConfirm}
                disabled={scheduleMutation.isPending}
                className="w-full rounded-lg bg-emerald-800 px-4 py-2 text-sm text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {scheduleMutation.isPending ? "Scheduling..." : "Book 7-, 14-, and 30-day visits"}
              </button>
            </>
          )}

          {result && (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">{result.message}</p>
              <div className="space-y-1.5">
                {(result.plan?.visits || []).map((visit) => (
                  <VisitRow key={visit.id} visit={visit} />
                ))}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
