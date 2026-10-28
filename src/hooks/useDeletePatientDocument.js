import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { deletePatient, getPatients } from "../api/hospitalApi";
import { updatePatientData } from "../redux/PatientSingleDateSlice";

export default function useDeletePatientDocument() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const refreshOpenPatient = () => {
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
  };

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: ({ patient_type, patient_name, patient_date }) => deletePatient(patient_type, patient_name, patient_date),
    onSuccess: () => {
      refreshOpenPatient();
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Deleted.");
    },
  });

  const errorMessage = error ? error?.response?.data?.error || error?.message || "Failed to delete." : null;

  return { remove: mutate, isPending, errorMessage, reset };
}
