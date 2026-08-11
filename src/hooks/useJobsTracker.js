import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import useProgress from "./useProgress";
import { saveFinalJobStatus } from "../redux/finalJobsStatusSlice";

export default function useJobsTracker() {
  const dispatch = useDispatch();
  const { eFaxJobs, ocrJobs, carePlanJobs } = useSelector((state) => state.jobsId);
  const dispatchedJobsRef = useRef(new Set());

  const jobs = [
    ...(Array.isArray(eFaxJobs) ? eFaxJobs.map((job) => ({ ...job, type: "eFax-job" })) : []),
    ...(Array.isArray(ocrJobs) ? ocrJobs.map((job) => ({ ...job, type: "ocr-job" })) : []),
    ...(Array.isArray(carePlanJobs) ? carePlanJobs.map((job) => ({ ...job, type: "care-plan-job" })) : []),
  ];

  const jobProgressQueries = useProgress(jobs);

  useEffect(() => {
    jobProgressQueries.forEach((q) => {
      if (q.isLoading || q.isError || q.data?.status === "INPROGRESS") return;

      const jobId = q.data?.job_id;
      const status = q.data?.status;
      if (!jobId) return;
      if (dispatchedJobsRef.current.has(jobId)) return;

      if (status === "COMPLETED" || status === "FAILED") {
        dispatchedJobsRef.current.add(jobId);

        const sourceJob = carePlanJobs.find((j) => j.job_id === jobId);

        // carePlanData goes into redux (in-memory, cheap) so pages can read
        // the just-generated plan straight off shared state instead of
        // re-fetching it — but NOT into the localStorage backup, to avoid
        // that growing unbounded across a long session. If a page needs the
        // full plan after a reload (redux/cache gone), it falls back to
        // GET /care_plan/:id using the carePlanId, which does survive here.
        const final = {
          jobId,
          status,
          message: q.data?.message,
          carePlanId: q.data?.care_plan_id,
          carePlanData: q.data?.care_plan_data,
          patientKey: sourceJob?.patientKey,
        };

        const existing = JSON.parse(localStorage.getItem("completed_jobs") || "[]");
        const alreadySaved = existing.some((j) => j.jobId === jobId);
        if (!alreadySaved) {
          const { carePlanData, ...lightweight } = final;
          existing.push(lightweight);
          localStorage.setItem("completed_jobs", JSON.stringify(existing));
          dispatch(saveFinalJobStatus(final));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobProgressQueries, dispatch]);
}
