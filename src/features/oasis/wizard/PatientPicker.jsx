import { useEffect, useState } from "react";
import { listOasisPatients } from "../api/oasisApi";

export default function PatientPicker({ onPickExisting, onAddNew }) {
  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listOasisPatients()
      .then((res) => {
        if (!cancelled) setPatients(res?.patients || []);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load patient list.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUseSelected = () => {
    const patient = patients.find((p) => p.patient_id === selectedId);
    if (!patient) return;
    onPickExisting(patient);
  };

  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Step 1 of 3 · Select Patient</p>

      {loading ? (
        <p className="py-6 text-center text-sm text-gray-500">Loading patients…</p>
      ) : error ? (
        <p className="py-6 text-center text-sm text-red-600">{error}</p>
      ) : (
        <>
          <label className="mb-1 block text-xs font-medium text-gray-600">Existing Patients</label>
          {patients.length === 0 ? (
            <p className="mb-3 text-sm text-gray-500">No existing patients yet.</p>
          ) : (
            <>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">— choose a patient —</option>
                {patients.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.patient_name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleUseSelected}
                disabled={!selectedId}
                className="mt-2 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Use Selected Patient →
              </button>
            </>
          )}

          <div className="my-4 text-center text-xs text-gray-400">— or —</div>

          <button
            type="button"
            onClick={onAddNew}
            className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + Add New Patient
          </button>
        </>
      )}
    </div>
  );
}
