import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { listOasisPatients } from "../api/oasisApi";
import FillWizard from "../wizard/FillWizard";

export default function OasisLandingPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWizard, setShowWizard] = useState(false);

  const loadPatients = () => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listOasisPatients()
      .then((res) => {
        if (!cancelled) setPatients(res?.patients || []);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load OASIS patients.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  };

  useEffect(loadPatients, []);

  const openPatient = (patient) => {
    const params = new URLSearchParams({
      patient_id: patient.patient_id || "",
      patient_name: patient.patient_name || "",
    });
    // navigate(`/app/oasis/patient?${params.toString()}`);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-3">
        <h2 className="text-sm font-semibold text-gray-800">OASIS Assessments</h2>
        <button
          type="button"
          onClick={() => setShowWizard(true)}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          + New Assessment
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-sm text-gray-500">Loading…</div>
      ) : error ? (
        <div className="p-6 text-sm text-red-600">{error}</div>
      ) : patients.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500">No OASIS patients yet</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {patients.map((patient) => (
            <button
              key={patient.patient_id}
              type="button"
              onClick={() => openPatient(patient)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
            >
              <span className="flex-1 text-sm font-medium text-gray-700">{patient.patient_name}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      )}

      {showWizard && (
        <FillWizard
          onClose={() => {
            setShowWizard(false);
            loadPatients();
          }}
        />
      )}
    </div>
  );
}
