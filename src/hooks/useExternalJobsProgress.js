import { useQueries } from "@tanstack/react-query";
import http from "../api/httpClient";

// Group B/C jobs (PCC, later Epic/Metriport) don't share Group A's single
// /ocr-progress endpoint — each job carries its own status_url instead
// (returned by its start call). This polls those directly, generically,
// so any future Group B/C feature can reuse it without new polling code.
const useExternalJobsProgress = (jobs = []) => {
  return useQueries({
    queries: jobs.map((job) => ({
      queryKey: ["external-job-progress", job.job_id],
      queryFn: () => http.get(job.status_url, { withAuth: true }),
      enabled: !!job.job_id && !!job.status_url,
      retry: false,
      staleTime: 0,
      refetchInterval: (query) => {
        const status = (query.state.data?.status || "").toLowerCase();
        if (status === "completed" || status === "failed") return false;
        return 3000;
      },
    })),
  });
};

export default useExternalJobsProgress;
