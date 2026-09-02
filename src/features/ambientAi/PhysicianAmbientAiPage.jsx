import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Mic, ChevronRight } from "lucide-react";
import usePatientRecords from "../../hooks/usePatientRecords";
import { buildPatientPayload } from "../../utils/buildPatientPayload";
import { addDischargePatientDate } from "../../redux/PatientSingleDateSlice";
import { clearChat, fetchPatientChat } from "../../redux/chatSlice";
import PhysicianAmbientAiPanel from "../patients/PhysicianAmbientAiPanel";

// Top-level route (sidebar entry, not nested under /app/patients/:id) — so
// unlike PatientDetails' panels, there's no patient in the URL to work from.
// This page owns its own patient pick, using the same
// buildPatientPayload/addDischargePatientDate/fetchPatientChat combo
// useOpenPatientDetail uses elsewhere, just without the navigate() — the
// physician stays on this page once a patient is picked.
export default function PhysicianAmbientAiPage() {
  const dispatch = useDispatch();
  const { user_id } = useSelector((state) => state.auth?.value) || {};
  const selected = useSelector((state) => state.patientsingledata?.value);
  const patients = usePatientRecords();
  const [search, setSearch] = useState("");

  // A patient left selected from an unrelated page (Patients list, a
  // previous visit) must never silently carry into a new Ambient AI
  // session — always start on a deliberate pick.
  useEffect(() => {
    dispatch(addDischargePatientDate(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients || [];
    return (patients || []).filter((p) => p.name?.toLowerCase().includes(q));
  }, [patients, search]);

  const pickPatient = (p) => {
    const payload = buildPatientPayload(p, user_id);
    dispatch(clearChat());
    dispatch(addDischargePatientDate(payload));
    dispatch(fetchPatientChat(payload));
  };

  const changePatient = () => dispatch(addDischargePatientDate(null));

  if (selected?.patient_name) {
    return (
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <div>
            <p className="text-[11px] text-gray-400">Ambient AI for</p>
            <p className="text-sm font-semibold text-gray-800">{selected.patient_name}</p>
          </div>
          <button type="button" onClick={changePatient} className="text-xs font-semibold text-emerald-700 hover:underline">
            Change patient
          </button>
        </div>
        <PhysicianAmbientAiPanel />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-800">Ambient AI — Visit Notes</h2>
        <p className="mt-1 text-xs text-gray-500">Pick a patient to start recording this visit.</p>
        <div className="relative mt-3">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients…"
            className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-500">No patients found</p>
        ) : (
          filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => pickPatient(p)}
              className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-left text-sm last:border-0 hover:bg-gray-50"
            >
              <span>
                <span className="font-medium text-gray-800">{p.name}</span>
                <span className="ml-2 text-xs text-gray-400">{p.type}</span>
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <Mic size={12} /> Start
                <ChevronRight size={12} />
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
