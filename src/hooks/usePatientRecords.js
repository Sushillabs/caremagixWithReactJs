// Shared fetch + normalize logic for the logged-in account's patient
// record(s). Used by PatientsList (caregiver/physician: many rows) and
// Dashboard (patient role: their own single record) so both stay in sync
// with the same backend shape.
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPatients } from "../api/hospitalApi";
import { addPatientNames } from "../redux/patientListSlice";
import useMyQuery from "./useMyQuery";

const EXTRA_SOURCE_KEYS = ["pcc_data", "epic_data", "metriport_data"];

export default function usePatientRecords() {
  const dispatch = useDispatch();
  const patients = useSelector((state) => state.patientnames.value);

  const { data, isSuccess } = useMyQuery({
    api: getPatients,
    id: "patientList",
    enabled: true,
    staleTime: 0,
  });

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

  return patients || [];
}
