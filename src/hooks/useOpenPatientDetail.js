// Shared "open a patient's detail page" action — same navigation chain
// used from the patients list (caregiver/physician) and the dashboard's
// own-record card (patient role), so both stay wired identically.
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addDischargePatientDate } from "../redux/PatientSingleDateSlice";
import { clearChat, fetchPatientChat } from "../redux/chatSlice";
import { buildPatientPayload } from "../utils/buildPatientPayload";

export default function useOpenPatientDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user_id } = useSelector((state) => state.auth?.value) || {};

  // `panel`/`tab` are optional — read by PatientDetails (?panel=) and passed
  // down to that panel (?tab=) to land on a specific view, e.g. from a
  // dashboard card, instead of always opening on the default record tab.
  return (p, { panel, tab } = {}) => {
    const payload = buildPatientPayload(p, user_id);

    dispatch(clearChat());
    dispatch(addDischargePatientDate(payload));
    dispatch(fetchPatientChat(payload));

    const params = new URLSearchParams();
    if (panel) params.set("panel", panel);
    if (tab) params.set("tab", tab);
    const search = params.toString();
    navigate(`/app/patients/${p.id}${search ? `?${search}` : ""}`);
  };
}
