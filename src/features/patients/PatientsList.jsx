import { useEffect, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPatients } from "../../api/hospitalApi";
import { addPatientNames } from "../../redux/patientListSlice";
import { addDischargePatientDate } from "../../redux/PatientSingleDateSlice";
import { clearChat, fetchPatientChat } from "../../redux/chatSlice";
import useMyQuery from "../../hooks/useMyQuery";

export default function PatientsList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useOutletContext() || {};
  const patients = useSelector((state) => state.patientnames.value);
  const { user_id } = useSelector((state) => state.auth?.value) || {};

  const filteredPatients = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return patients || [];
    return (patients || []).filter((p) => p.name?.toLowerCase().includes(q));
  }, [patients, search]);

  const { data, isSuccess } = useMyQuery({
    api: getPatients,
    id: "patientList",
    enabled: true,
    staleTime: 0,
  });

  const EXTRA_SOURCE_KEYS = ["pcc_data", "epic_data", "metriport_data"];

  useEffect(() => {
    if (!isSuccess || !data) return;

    const { data: patientsList_api, ...rest } = data;
    const fromApi = (patientsList_api || []).map((p) => ({
      id: crypto.randomUUID(),
      type: "Uploaded",
      name: p.name,
      raw: p,
    }));

    const fromExtraSources = EXTRA_SOURCE_KEYS.flatMap((key) => {
      const source = rest[key];
      if (!source?.details) return [];
      let type = key.replace(/_data$/, ""); // "pcc" | "epic" | "metriport"
      type = type.charAt(0).toUpperCase() + type.slice(1);
      return Object.entries(source.details).map(([name, detailsArray]) => ({
        id: crypto.randomUUID(),
        type,
        name,
        details: detailsArray,
        raw: { patient_type: source.patient_type || type },
      }));
    });

    dispatch(addPatientNames([...fromApi, ...fromExtraSources]));
  }, [isSuccess, data, dispatch]);

  // Backend /ask (query_api.py:690-714) branches on patient_type using exact
  // literals for pulled sources ("PCC", "epic", "metriport"), not our
  // display casing ("Pcc", "Epic", "Metriport").
  const BACKEND_PATIENT_TYPE = { Pcc: "PCC", Epic: "epic", Metriport: "metriport" };

  const handlePatient = (p) => {
    // No specific document is picked yet on this page (that's the real
    // Patient Details page, a later phase) — default to each patient's
    // first document/detail entry so the assistant has a valid target,
    // same two-branch shape as legacy PatientList.jsx:68-72.

    let payload = {};
    if (p?.type === "Uploaded") {
      const firstDoc = p.raw?.data?.[0];
      payload = { patient_date: firstDoc?.dates, patient_name: p.name, patient_type: firstDoc?.patient_type, user_id };
    } else {
      payload = { patient_collection: p.details?.[0], user_id, patient_type: BACKEND_PATIENT_TYPE[p?.type], patient_name: p.name };
    }

    dispatch(clearChat());
    dispatch(addDischargePatientDate(p));
    dispatch(fetchPatientChat(payload));
    navigate(`/app/patients/${p.id}`);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
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
                <button type="button" className="font-medium text-emerald-600 hover:underline" onClick={() => handlePatient(p)}>
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
