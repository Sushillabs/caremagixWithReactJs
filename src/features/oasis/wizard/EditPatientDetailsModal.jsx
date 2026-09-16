import { useEffect, useState } from "react";
import { X } from "lucide-react";
import PrefillDemographics from "./PrefillDemographics";
import { getOasisForm, saveOasisForm } from "../api/oasisApi";

export default function EditPatientDetailsModal({ patient, onClose, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [initialName, setInitialName] = useState({});
  const [initialPatientDetails, setInitialPatientDetails] = useState({});

  useEffect(() => {
    let cancelled = false;
    getOasisForm({ patient_id: patient.patient_id, patient_name: patient.patient_name })
      .then((data) => {
        if (cancelled) return;
        const pd = data?.patient_details || {};
        setInitialName({
          first_name: pd.M0040_first || patient.patient_name.split(" ")[0] || "",
          last_name: pd.M0040_last || patient.patient_name.split(" ").slice(-1)[0] || "",
          mi: pd.M0040_mi || "",
          suffix: pd.M0040_suffix || "",
        });
        setInitialPatientDetails(pd);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [patient.patient_id, patient.patient_name]);

  const handleSubmit = async ({ patientName, patientDetails }) => {
    await saveOasisForm({
      patient_name: patientName,
      patient_id: patient.patient_id,
      new_patient: false,
      patient_details: patientDetails,
    });
    onSaved?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Edit Patient Details</span>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-gray-500">Loading patient data…</p>
        ) : (
          <PrefillDemographics
            formLabel={patient.patient_name}
            isExisting
            initialName={initialName}
            initialPatientDetails={initialPatientDetails}
            onBack={onClose}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
