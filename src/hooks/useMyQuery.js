import { useQuery } from "@tanstack/react-query"

const useMyQuery = ({ api, id, enabled = true, staleTime }) => {
  return useQuery({
    queryKey: Array.isArray(id) ? id : [id],
    queryFn: api,
    enabled,
    staleTime: staleTime ?? 5 * 60 * 1000,// data is fresh for 5 minutes by default
    gcTime: 24 * 60 * 60 * 1000, // keep cache for 24 hours
  });
};

export default useMyQuery;
