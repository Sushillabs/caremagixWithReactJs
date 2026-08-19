import useJobPull from "./useJobPull";
import { getPccData, getPccDataStatus } from "../api/hospitalApi";

const usePccPull = () =>
  useJobPull({
    startFn: getPccData,
    statusFn: getPccDataStatus,
    toastId: "pcc-toast",
    defaultMsg: "Pulling PCC data...",
    jobsSliceKey: "pccJobs",
  });

export default usePccPull;
