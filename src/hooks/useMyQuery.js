import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useMyQuery = ({ api, id, enabled = true, staleTime, toastId }) => {
  const query = useQuery({
    queryKey: Array.isArray(id) ? id : [id],
    queryFn: api,
    enabled,
    staleTime: staleTime ?? 5 * 60 * 1000, // data is fresh for 5 minutes by default
    gcTime: 24 * 60 * 60 * 1000, // keep cache for 24 hours
  });

  useEffect(() => {
    if (!toastId || !enabled) return;

    if (query.isPending) {
      toast.loading("Waiting for response...", { id: toastId });
      return;
    }

    if (query.isError) {
      toast.error(query.error?.message || "Something went wrong", { id: toastId });
      return;
    }

    if (query.isSuccess) {
      toast.dismiss(toastId);
    }
  }, [toastId, enabled, query.isPending, query.isError, query.isSuccess, query.error]);

  return query;
};

export default useMyQuery;
