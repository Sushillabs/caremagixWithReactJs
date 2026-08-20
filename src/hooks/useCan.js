import { useSelector } from "react-redux";
import { canUseFeature } from "../config/features";

export default function useCan(key) {
  const role = useSelector((state) => state.auth?.value?.role) || "caregiver";
  return canUseFeature(role, key);
}
