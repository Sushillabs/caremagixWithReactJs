import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addDischargePatientDate } from "../redux/PatientSingleDateSlice";
import { clearChat, fetchPatientChat, resetInitialChat } from "../redux/chatSlice";
import { buildPatientPayload } from "../utils/buildPatientPayload";

export default function useOpenPatientDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user_id } = useSelector((state) => state.auth?.value) || {};

  return (p, { panel, tab, carePlanId } = {}) => {
    const payload = buildPatientPayload(p, user_id);

    dispatch(clearChat());
    dispatch(resetInitialChat(payload));
    dispatch(addDischargePatientDate(payload));
    dispatch(fetchPatientChat(payload));

    if (carePlanId) {
      navigate(`/app/patients/${p.id}/care-plan/view?care_plan_id=${encodeURIComponent(carePlanId)}`);
      return;
    }

    const params = new URLSearchParams();
    if (panel) params.set("panel", panel);
    if (tab) params.set("tab", tab);
    const search = params.toString();
    navigate(`/app/patients/${p.id}${search ? `?${search}` : ""}`);
  };
}
