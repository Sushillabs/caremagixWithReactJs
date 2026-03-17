import { useSelector, useDispatch } from "react-redux"
import useProgress from "../hooks/useProgress.js";
import { useEffect, useRef, useState } from "react";
import { saveFinalJobStatus } from "../redux/finalJobsStatusSlice";

const UploadPlan = () => {
  console.log('inside upload plan');
  const [completedJobs, setCompletedJobs] = useState([]);
  const { eFaxJobs, ocrJobs } = useSelector((state) => state.jobsId);
  const dispatch = useDispatch();
  const dispatchedJobsRef = useRef(new Set());

  const jobsId = [
    ...(Array.isArray(eFaxJobs) ? eFaxJobs.map((job) => ({ ...job, type: 'eFax-job' })) : []),
    ...(Array.isArray(ocrJobs) ? ocrJobs.map((job) => ({ ...job, type: 'ocr-job' })) : []),
    // ...(ocrJobs?.job_id ? [{ ...ocrJobs, type: 'ocr-job' }] : [])
  ];
  const jobProgressQueries = useProgress(jobsId);

  const progressJobsUI = jobProgressQueries.map((query) => {
    if (query.isLoading) {
      return { job_id: "loading", message: "Loading...", progress: 0 };
    }

    if (query.isError) {
      return { job_id: "error", message: "Error loading job", progress: 0 };
    }

    return query.data;
  });

const jobMap = new Map();

progressJobsUI.forEach(job => jobMap.set(job.job_id, job));

completedJobs.forEach(job => {
  if (!jobMap.has(job.jobId)) {
    jobMap.set(job.jobId, {
      job_id: job.jobId,
      message: job.message,
      progress: 100,
      status: job.status
    });
  }
});

const allJobs = Array.from(jobMap.values());

   useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("completed_jobs") || "[]");
    setCompletedJobs(saved)
  }, [])

  useEffect(() => {
    jobProgressQueries.forEach((q) => {
      if (q.isLoading || q.isError || q.data?.status === 'INPROGRESS') return;

      const jobId = q.data?.job_id;
      const status = q.data?.status;

      if (!jobId) return;

      // 🚫 ABSOLUTE LOOP BREAKER
      if (dispatchedJobsRef.current.has(jobId)) return;

      if (status === "COMPLETED" || status === "FAILED") {
        dispatchedJobsRef.current.add(jobId);
        let final = {
          jobId,
          status,
          message: q.data?.message,
        }

        const existing = JSON.parse(localStorage.getItem("completed_jobs") || "[]");

        const alreadySaved = existing.some((j) => j.jobId === jobId);

        if (!alreadySaved) {
          existing.push(final);
          localStorage.setItem("completed_jobs", JSON.stringify(existing));
          setCompletedJobs(existing);
          dispatch(saveFinalJobStatus(final));
        }

       
      }
    });
  }, [jobProgressQueries, dispatch]);

 


  return (
    <div className="h-full flex flex-col">
      <h2 className="text-sm font-semibold mb-2">{allJobs.length > 0 ? 'Uploaded Plan' : 'No Uploaded Plan'}</h2>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {allJobs.map((job, index) => (
          <div
            key={job.job_id || index}
            className="border rounded px-3 py-2 flex items-center gap-2 text-xs sm:text-sm"
          >
            <span className="flex-1 truncate text-gray-900">
              {job.file_name || job.job_id}
            </span>

            <span
              className={`hidden sm:block flex-1 truncate ${job.progress === 100 ? "text-green-500" : "text-gray-600"
                }`}
            >
              {job.message}
            </span>

            <span
              className={`w-12 shrink-0 text-right font-semibold ${job.progress === 100 ? "text-green-500" : "text-blue-500"
                }`}
            >
              {job.progress}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );

}

export default UploadPlan