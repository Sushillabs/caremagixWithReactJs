import { useQuery } from "@tanstack/react-query"

const useMyQuery = ({api, id, enabled=true}) => {
    const query = useQuery({
        queryKey: [id],
        queryFn: api,
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled,
    });

    return query;
}
export default useMyQuery;