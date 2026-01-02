import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useMyMutation = ({ api, toastId }) => {
  const mutation = useMutation({
    mutationFn: api,

    onMutate: () => {
      toast.loading("Waiting for response...", { id: toastId });
    },

    onSuccess: (data) => {
      toast.success("Operation successful", { id: toastId });
    },

    onError: (error) => {
      toast.error(error?.message || "Something went wrong", { id: toastId });
    },
  });

  return mutation;
};

export default useMyMutation;
