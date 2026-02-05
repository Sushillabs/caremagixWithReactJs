import { useSelector, useDispatch } from "react-redux"
import useProgress from "../hooks/useProgress.js";
import { useEffect,useRef } from "react";
import { saveFinalJobStatus } from "../redux/finalJobsStatusSlice";

const UploadPlan = () => {
  const { eFaxJobs, ocrJobs } = useSelector((state) => state.jobsId);
  const dispatch = useDispatch();
  const dispatchedJobsRef = useRef(new Set());

  const jobsId = [
    ...(Array.isArray(eFaxJobs) ? eFaxJobs.map((job) => ({ ...job, type: 'eFax-job' })) : []),
    ...ocrJobs?.job_id ? [{ ...ocrJobs, type: 'ocr-job' }] : []
  ];
const jobProgressQueries = useProgress(jobsId);

useEffect(() => {
  jobProgressQueries.forEach((q) => {
    if (q.isLoading || q.isError || q.data?.status==='INPROGRESS') return;

    const jobId = q.data?.job_id;
    const status = q.data?.status;

    if (!jobId) return;

    // 🚫 ABSOLUTE LOOP BREAKER
    if (dispatchedJobsRef.current.has(jobId)) return;

    if (status === "COMPLETED" || status === "FAILED") {
      dispatchedJobsRef.current.add(jobId);

      dispatch(saveFinalJobStatus({
        jobId,
        status,
        message: q.data?.message,
      }));
    }
  });
}, [jobProgressQueries, dispatch]);



return (
  <div className="h-full flex flex-col">
    <h2 className="text-sm font-semibold mb-2">{jobProgressQueries.length>0? 'Uploaded Plan':'No Uploaded Plan'}</h2>

    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
      {jobProgressQueries.map((query, index) => {
        if (query.isLoading) {
          return (
            <div
              key={index}
              className="text-xs text-gray-500 border rounded px-3 py-2"
            >
              Loading...
            </div>
          );
        }

        if (query.isError) {
          return (
            <div
              key={index}
              className="text-xs text-red-500 border rounded px-3 py-2"
            >
              Error loading job
            </div>
          );
        }

        const { type, file_name, message, progress,job_id } = query.data || {};

        return (
          <div
            key={query.data?.job_id || index}
            className="border rounded px-3 py-2 flex items-center gap-2 text-xs sm:text-sm"
          >
            {/* <span className="w-14 shrink-0 text-gray-600 font-medium truncate">
              {file_name ||job_id}
            </span> */}
            <span className="flex-1 truncate text-gray-900">
              {file_name ||job_id}
            </span>
            <span className="hidden sm:block flex-1 truncate text-gray-600">
              {message}
            </span>
            <span className="w-12 shrink-0 text-right font-semibold text-blue-600">
              {progress}%
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

}

export default UploadPlan