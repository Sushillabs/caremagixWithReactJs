import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { OASIS_FORM_OPTIONS } from "../wizard/wizardOptions";
import EditPatientDetailsModal from "../wizard/EditPatientDetailsModal";

export default function OasisPatientDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showEditModal, setShowEditModal] = useState(false);

  const patient = {
    patient_id: searchParams.get("patient_id") || "",
    patient_name: searchParams.get("patient_name") || "",
  };

  const openForm = (formType, mode) => {
    const params = new URLSearchParams({
      patient_id: patient.patient_id,
      patient_name: patient.patient_name,
      mode,
    });
    navigate(`/app/oasis/${formType.toLowerCase()}?${params.toString()}`);
  };

  if (!patient.patient_id) {
    return <div className="p-6 text-sm text-red-600">Missing patient_id in the URL — open this page from the OASIS patient list, not directly.</div>;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <button
        type="button"
        onClick={() => navigate("/app/oasis")}
        className="mb-3 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={14} /> Back to OASIS Assessments
      </button>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">{patient.patient_name}</h2>
        <button type="button" onClick={() => setShowEditModal(true)} className="text-xs font-medium text-blue-600 hover:underline">
          Edit Patient Details
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {OASIS_FORM_OPTIONS.map((f) => (
          <div key={f.formType} className="rounded-lg border border-gray-200 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">{f.formType}</span>
              {!f.built && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400"></span>}
            </div>
            <div className="mb-3 text-xs text-gray-400">{f.label}</div>
            {f.built && (
              <div className="flex gap-3">
                <button type="button" onClick={() => openForm(f.formType, "fill")} className="text-xs font-medium text-blue-600 hover:underline">
                  Fill
                </button>
                <button type="button" onClick={() => openForm(f.formType, "review")} className="text-xs font-medium text-emerald-600 hover:underline">
                  Review
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showEditModal && <EditPatientDetailsModal patient={patient} onClose={() => setShowEditModal(false)} />}
    </div>
  );
}
