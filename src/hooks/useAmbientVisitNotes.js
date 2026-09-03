import { useSelector } from "react-redux";
import useAgentChat from "./useAgentChat";
import { caregiverAmbientNoteApi, physicianAmbientNoteApi } from "../api/hospitalApi";

// noteKind "discharge"/"handoff" -> physician endpoint; omit -> caregiver visit note.
export default function useAmbientVisitNotes({ noteKind } = {}) {
  const patientData = useSelector((state) => state?.patientsingledata?.value);
  const api = noteKind ? physicianAmbientNoteApi : caregiverAmbientNoteApi;

  const readyMessage = (data) =>
    `The ${(data?.note_label || "note").toLowerCase()} is ready. Please review and save it.`;

  const loadHistory = async () => {
    const data = await api.start({
      patient_name: patientData?.patient_name,
      patient_type: patientData?.patient_type,
      ...(noteKind ? { note_kind: noteKind } : {}),
    });
    return {
      session_id: data.session_id,
      chat_history: [{ role: "assistant", content: data.next_question }],
    };
  };

  const sendMessage = async ({ message, session_id, include_audio }) => {
    const data = await api.turn({ session_id, message, include_audio: !!include_audio });
    return {
      ...data,
      message: data.status === "generated" ? readyMessage(data) : data.next_question,
    };
  };

  const chat = useAgentChat({ sendMessage, loadHistory });

  const stopAndGenerate = () =>
    chat.runAction(async () => {
      const data = await api.stop({ session_id: chat.sessionId });
      return {
        ...data,
        message: data.status === "generated" ? readyMessage(data) : data.next_question,
      };
    });

  return { ...chat, stopAndGenerate, noteKind: noteKind || null, saveNote: api.save, fetchVoiceToken: api.liveToken };
}
