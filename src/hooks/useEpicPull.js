import useJobPull from "./useJobPull";
import { pullEpicData, getEpicPullStatus } from "../api/hospitalApi";

const useEpicPull = () =>
  useJobPull({
    startFn: pullEpicData,
    statusFn: getEpicPullStatus,
    toastId: "epic-toast",
    defaultMsg: "Pulling Epic data...",
    jobsSliceKey: "epicJobs",
  });

export default useEpicPull;
