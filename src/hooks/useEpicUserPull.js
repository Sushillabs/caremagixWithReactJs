import useJobPull from "./useJobPull";
import { startEpicUserPull, getEpicUserPullStatus } from "../api/hospitalApi";

const useEpicUserPull = () =>
  useJobPull({
    startFn: startEpicUserPull,
    statusFn: getEpicUserPullStatus,
    toastId: "epic-user-toast",
    defaultMsg: "Pulling your Epic data...",
    jobsSliceKey: "epicUserJobs",
  });

export default useEpicUserPull;
