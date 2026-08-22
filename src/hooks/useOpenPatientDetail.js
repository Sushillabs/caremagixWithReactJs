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

  return (p) => {
    const payload = buildPatientPayload(p, user_id);

    dispatch(clearChat());
    dispatch(addDischargePatientDate(payload));
    dispatch(fetchPatientChat(payload));
    navigate(`/app/patients/${p.id}`);
  };
}
