import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { getPatients } from "../api/hospitalApi";
import { updatePatientData } from "../redux/PatientSingleDateSlice";

// Backend indexes /upload in a background thread, so new documents need a short wait.
export const NEW_DOC_REFRESH_DELAY_MS = 6000;

export default function useRefreshOpenPatient() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const run = useCallback(() => {
    queryClient
      .fetchQuery({ queryKey: ["patientList"], queryFn: getPatients, staleTime: 0 })
      .then((res) => {
        dispatch((innerDispatch, getState) => {
          const open = getState().patientsingledata?.value?.patient;
          if (open?.type !== "Uploaded" || !open.raw) return;
          const fresh = res?.data?.find((p) => p.name === open.name);
          if (fresh) innerDispatch(updatePatientData(fresh));
        });
      })
      .catch(() => {});
  }, [queryClient, dispatch]);

  return useCallback((delayMs = 0) => (delayMs ? setTimeout(run, delayMs) : run()), [run]);
}
