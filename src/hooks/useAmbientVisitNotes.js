import { useSelector } from "react-redux";
import useAgentChat from "./useAgentChat";
import { ambientAiStart, ambientAiTurn, ambientAiStop } from "../api/hospitalApi";

const GENERATED_MESSAGE = "The visit note is ready. Please review and save it.";

// Adapts caregiver_ambient_ai's session shape ({success, data:{next_question,
// status, ...}}, already unwrapped to `data` by hospitalApi.js) onto
// useAgentChat's generic {session_id, message} turn contract — see
// notesSlice.js discussion history for why this couldn't just reuse
// /discharge_plan_agent: different backend module entirely, session-based
// instead of the old multi-action endpoint.
export default function useAmbientVisitNotes() {
  const patientData = useSelector((state) => state?.patientsingledata?.value);

  const loadHistory = async () => {
    const data = await ambientAiStart({
      patient_name: patientData?.patient_name,
      patient_type: patientData?.patient_type,
    });
    return {
      session_id: data.session_id,
      chat_history: [{ role: "assistant", content: data.next_question }],
    };
  };

  const sendMessage = async ({ message, session_id, include_audio }) => {
    const data = await ambientAiTurn({ session_id, message, include_audio: !!include_audio });
    return {
      ...data,
      message: data.status === "generated" ? GENERATED_MESSAGE : data.next_question,
    };
  };

  const chat = useAgentChat({ sendMessage, loadHistory });

  // Ends the conversation and asks the backend to assemble the note from
  // whatever was captured so far — a distinct action, not a chat turn (no
  // user message to echo), so it goes through runAction instead of send().
  const stopAndGenerate = () =>
    chat.runAction(async () => {
      const data = await ambientAiStop({ session_id: chat.sessionId });
      return {
        ...data,
        message: data.status === "generated" ? GENERATED_MESSAGE : data.next_question,
      };
    });

  return { ...chat, stopAndGenerate };
}
