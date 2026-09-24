import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deletePatient } from "../api/hospitalApi";

export default function useDeletePatientDocument() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: ({ patient_type, patient_name, patient_date }) => deletePatient(patient_type, patient_name, patient_date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patientList"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Deleted.");
    },
  });

  const errorMessage = error ? error?.response?.data?.error || error?.message || "Failed to delete." : null;

  return { remove: mutate, isPending, errorMessage, reset };
}
