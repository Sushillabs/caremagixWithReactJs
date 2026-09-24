import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { UserPlus, Trash2 } from "lucide-react";
import usePatientRecords from "../../hooks/usePatientRecords";
import useOpenPatientDetail from "../../hooks/useOpenPatientDetail";
import useCan from "../../hooks/useCan";
import AddPatientModal from "./AddPatientModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import useDeletePatientDocument from "../../hooks/useDeletePatientDocument";

export default function PatientsList() {
  const { search } = useOutletContext() || {};
  const patients = usePatientRecords();
  const handlePatient = useOpenPatientDetail();
  const [showAddPatient, setShowAddPatient] = useState(false);
  const canAddPatient = useCan("addPatient");
  const canDeletePatient = useCan("deletePatient");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { remove, isPending, errorMessage, reset } = useDeletePatientDocument();

  const handleConfirmDelete = () => {
    const firstDoc = deleteTarget?.raw?.data?.[0];
    remove(
      {
        patient_name: deleteTarget?.name,
        patient_type: firstDoc?.patient_type || deleteTarget?.raw?.patient_type,
        patient_date: "Consolidated Med Summary",
      },
      { onSuccess: () => setDeleteTarget(null) }
    );
  };

  const filteredPatients = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return patients || [];
    return (patients || []).filter((p) => p.name?.toLowerCase().includes(q));
  }, [patients, search]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-3">
        <h2 className="text-sm font-semibold text-gray-800">Patients</h2>
        {canAddPatient && (
          <button
            type="button"
            onClick={() => setShowAddPatient(true)}
            className="flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
          >
            <UserPlus size={14} /> Add New Patient
          </button>
        )}
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <th className="px-4 py-3 font-medium">SL No</th>
            <th className="px-4 py-3 font-medium">Patient name</th>
            <th className="px-4 py-3 font-medium">Data Origin</th>
            <th className="px-4 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                No patients found
              </td>
            </tr>
          )}
          {filteredPatients.map((p, idx) => (
            <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
              <td className="px-4 py-3 text-gray-700">{p.name}</td>
              <td className="px-4 py-3 text-gray-700">{p.type}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <button type="button" className="font-medium text-emerald-600 hover:underline" onClick={() => handlePatient(p)}>
                    View Details
                  </button>
                  {canDeletePatient && (
                    <button
                      type="button"
                      title="Delete patient and all documents"
                      onClick={() => setDeleteTarget(p)}
                      className="text-gray-300 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddPatient && <AddPatientModal onClose={() => setShowAddPatient(false)} />}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Patient"
          message={`Delete ${deleteTarget.name} and all of their documents? This cannot be undone.`}
          confirmLabel="Delete Patient"
          pending={isPending}
          error={errorMessage}
          onCancel={() => {
            reset();
            setDeleteTarget(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
