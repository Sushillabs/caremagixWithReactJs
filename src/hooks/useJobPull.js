import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { setJobsId } from "../redux/jobsIdslice";

// Shared engine behind Group B pull features (PCC, Epic, ...) — confirmed
// identical wire shape on both: {success, job_id, status_url, message} to
// start, lowercase pending/running/completed/failed with no numeric
// progress to poll. Each feature just supplies its own start/status calls
// and identity; this hook does the polling/toast/redux-tracking once.
export default function useJobPull({ startFn, statusFn, toastId, defaultMsg, jobsSliceKey, pollMs = 3000 }) {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [jobId, setJobId] = useState(null);
  const [softPct, setSoftPct] = useState(0);
  const [message, setMessage] = useState(defaultMsg);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);
  const handledRef = useRef(null);

  const resetJob = useCallback(() => {
    setJobId(null);
    setSoftPct(0);
    setIsStarting(false);
  }, []);

  const {
    data: statusData,
    isError: isStatusError,
    error: statusError,
  } = useQuery({
    queryKey: [toastId, "status", jobId],
    queryFn: () => statusFn(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = (query.state.data?.status || "").toLowerCase();
      if (status === "completed" || status === "failed") return false;
      return pollMs;
    },
    retry: false,
    staleTime: 0,
  });

  const status = (statusData?.status || "").toLowerCase();
  const isRunning = isStarting || (!!jobId && status !== "completed" && status !== "failed");
  const showProgress = isStarting || !!jobId;

  // Soft progress + message while pending/running (backend gives no real %)
  useEffect(() => {
    if (!jobId || !statusData) return;

    const currentStatus = (statusData.status || "").toLowerCase();

    if (currentStatus === "completed") {
      setSoftPct(100);
      setMessage(statusData.message || "Done");
      return;
    }

    if (currentStatus === "failed") return;

    setSoftPct((prev) => Math.min(90, prev < 5 ? 5 : prev + 8));
    setMessage(statusData.message || defaultMsg);
  }, [jobId, statusData, defaultMsg]);

  // Terminal: completed
  useEffect(() => {
    if (!jobId || status !== "completed") return;
    if (handledRef.current === jobId) return;
    handledRef.current = jobId;

    toast.success(statusData?.message || "Data fetched successfully", { id: toastId });
    queryClient.invalidateQueries({ queryKey: ["patientList"] });

    const t = setTimeout(resetJob, 400);
    return () => clearTimeout(t);
  }, [jobId, status, statusData?.message, queryClient, resetJob, toastId]);

  // Terminal: failed
  useEffect(() => {
    if (!jobId || status !== "failed") return;
    if (handledRef.current === jobId) return;
    handledRef.current = jobId;

    toast.error(statusData?.error || statusData?.message || "Job failed", { id: toastId });
    setError(statusData?.error || statusData?.message || "Job failed");
    resetJob();
  }, [jobId, status, statusData, resetJob, toastId]);

  // Poll HTTP error
  useEffect(() => {
    if (!isStatusError || !jobId) return;
    if (handledRef.current === jobId) return;
    handledRef.current = jobId;

    const msg = statusError?.response?.data?.error || statusError?.response?.data?.message || statusError?.message || "Failed to check job status";

    toast.error(msg, { id: toastId });
    setError(msg);
    resetJob();
  }, [isStatusError, statusError, jobId, resetJob, toastId]);

  const start = useCallback(async () => {
    if (isRunning) return;

    setError(null);
    setIsStarting(true);
    setSoftPct(5);
    setMessage(defaultMsg);
    handledRef.current = null;
    toast.loading(defaultMsg, { id: toastId });

    try {
      const response = await startFn();

      if (response?.success && response?.job_id && response?.status_url) {
        setMessage(response.message || defaultMsg);
        setJobId(response.job_id);
        setIsStarting(false);
        toast.dismiss(toastId);
        // So the job stays visible on the Jobs page even if whatever
        // triggered this (e.g. a confirm modal) unmounts right after.
        dispatch(setJobsId({ [jobsSliceKey]: { job_id: response.job_id, status_url: response.status_url } }));
        return;
      }

      const errMsg = response?.error || response?.message || "Failed to start job";
      setError(errMsg);
      toast.error(errMsg, { id: toastId });
      resetJob();
    } catch (err) {
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Server error occurred";
      setError(errMsg);
      toast.error(errMsg, { id: toastId });
      resetJob();
    }
  }, [isRunning, resetJob, dispatch, startFn, defaultMsg, toastId, jobsSliceKey]);

  return {
    start,
    isRunning,
    showProgress,
    progress: softPct,
    message,
    error,
  };
}
