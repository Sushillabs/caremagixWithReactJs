import { useQueries } from "@tanstack/react-query";
import { getCms485Progress } from "./api/cms485Api";

const isDone = (data) => data?.status === "COMPLETED" || data?.status === "FAILED" || Number(data?.progress) >= 100;

export default function useCms485Progress(jobs = []) {
  return useQueries({
    queries: jobs.map((job) => ({
      queryKey: ["cms485-progress", job.job_id],
      queryFn: () => getCms485Progress(job.job_id),
      enabled: !!job.job_id,
      retry: false,
      staleTime: 0,
      refetchInterval: (query) => (isDone(query.state.data) || query.state.status === "error" ? false : 2500),
    })),
  });
}
