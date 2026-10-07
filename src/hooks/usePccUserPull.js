import useJobPull from "./useJobPull";
import { startPccUserPull, getPccUserPullStatus } from "../api/hospitalApi";

const usePccUserPull = () =>
  useJobPull({
    startFn: startPccUserPull,
    statusFn: getPccUserPullStatus,
    toastId: "pcc-user-toast",
    defaultMsg: "Pulling PointClickCare data...",
    jobsSliceKey: "pccUserJobs",
  });

export default usePccUserPull;
