import { useQueries } from "@tanstack/react-query";
import { getProgress } from "../api/hospitalApi";
import { useSelector, useDispatch } from "react-redux"
// import { saveServerFailMap } from "../redux/finalJobsStatusSlice"

const useProgress = (jobs = []) => {
  // const dispatch=useDispatch();
  // const serverFailMap = useSelector((state) => state.finalJobStatus.serverFailMap);
  const finalJobStatusMap = useSelector((state) => state.finalJobStatus.finalJobs);
  console.log('finalJobStatusMap in useProgress:', finalJobStatusMap);
  return useQueries({
    queries: jobs.map((job) => {
      const jobIdExists = !!job.job_id;
      const jobNotFinalized = !finalJobStatusMap.find((finalJob) => finalJob.jobId === job.job_id);

      console.log("ENABLED CHECK:", job.job_id, {
        jobIdExists,
        jobNotFinalized,
        enabled: jobIdExists && jobNotFinalized,
      });

      return {
        queryKey: ["job-progress", job.type, job.job_id],
        queryFn: () => getProgress(job.job_id),
        enabled: jobIdExists && jobNotFinalized,
        retry: false, //defaut it is 3
        // onError: (error) => {
        //   console.log("Server error for job:", error);
        //   dispatch(saveServerFailMap(job.job_id));
        // },
        refetchInterval: (query) => {
          const status = query?.state?.data?.status;
          console.log("Refetch interval check:", job.job_id, query?.state);
          if (status === "COMPLETED" || status === "FAILED" || query?.state?.status === "error") {
            return false;
          }
          return 2 * 60 * 1000;
        },
        staleTime: Infinity,
        gcTime: 24*60 * 60 * 1000,
      };
    }),
  });

};

export default useProgress;
