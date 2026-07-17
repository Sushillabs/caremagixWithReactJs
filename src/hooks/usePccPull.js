import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getPccData, getPccDataStatus } from "../api/hospitalApi";

const TOAST_ID = "pcc-toast";
const DEFAULT_MSG = "Pulling PCC data...";
const POLL_MS = 3000;

const usePccPull = () => {
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState(null);
  const [softPct, setSoftPct] = useState(0);
  const [message, setMessage] = useState(DEFAULT_MSG);
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
    queryKey: ["pcc-status", jobId],
    queryFn: () => getPccDataStatus(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = (query.state.data?.status || "").toLowerCase();
      if (status === "completed" || status === "failed") return false;
      return POLL_MS;
    },
    retry: false,
    staleTime: 0,
  });

  const status = (statusData?.status || "").toLowerCase();
  const isRunning = isStarting || (!!jobId && status !== "completed" && status !== "failed");
  const showProgress = isStarting || !!jobId;

  // Soft progress + message while pending/running (same as JS softPct)
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
    setMessage(statusData.message || DEFAULT_MSG);
  }, [jobId, statusData]);

  // Terminal: completed
  useEffect(() => {
    if (!jobId || status !== "completed") return;
    if (handledRef.current === jobId) return;
    handledRef.current = jobId;

    toast.success(statusData?.message || "PCC data fetched successfully", { id: TOAST_ID });
    queryClient.invalidateQueries({ queryKey: ["patientList"] });

    const t = setTimeout(resetJob, 400);
    return () => clearTimeout(t);
  }, [jobId, status, statusData?.message, queryClient, resetJob]);

  // Terminal: failed
  useEffect(() => {
    if (!jobId || status !== "failed") return;
    if (handledRef.current === jobId) return;
    handledRef.current = jobId;

    toast.error(statusData?.error || statusData?.message || "Job failed", { id: TOAST_ID });
    setError(statusData?.error || statusData?.message || "Job failed");
    resetJob();
  }, [jobId, status, statusData, resetJob]);

  // Poll HTTP error
  useEffect(() => {
    if (!isStatusError || !jobId) return;
    if (handledRef.current === jobId) return;
    handledRef.current = jobId;

    const msg = statusError?.response?.data?.error || statusError?.response?.data?.message || statusError?.message || "Failed to check job status";

    toast.error(msg, { id: TOAST_ID });
    setError(msg);
    resetJob();
  }, [isStatusError, statusError, jobId, resetJob]);

  const start = useCallback(async () => {
    if (isRunning) return;

    setError(null);
    setIsStarting(true);
    setSoftPct(5);
    setMessage(DEFAULT_MSG);
    handledRef.current = null;
    toast.loading(DEFAULT_MSG, { id: TOAST_ID });

    try {
      const response = await getPccData();

      if (response?.success && response?.job_id && response?.status_url) {
        setMessage(response.message || DEFAULT_MSG);
        setJobId(response.job_id);
        setIsStarting(false);
        toast.dismiss(TOAST_ID);
        return;
      }

      const errMsg = response?.error || response?.message || "Failed to start job";
      setError(errMsg);
      toast.error(errMsg, { id: TOAST_ID });
      resetJob();
    } catch (err) {
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Server error occurred";
      setError(errMsg);
      toast.error(errMsg, { id: TOAST_ID });
      resetJob();
    }
  }, [isRunning, resetJob]);

  return {
    start,
    isRunning,
    showProgress,
    progress: softPct,
    message,
    error,
  };
};

export default usePccPull;
