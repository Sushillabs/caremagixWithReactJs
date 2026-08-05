import AiCareAssistant from "../assistant/AiCareAssistant";

// Renders the assistant only when the active section opts in (section.assistant).
// Keeps Dashboard and other overview sections free of the chat bar. For
// sections that requirePatient (e.g. patients), also wait until we're past
// the list view into a specific record (isDetail) — no assistant on
// /app/patients, only on /app/patients/:id.
export default function DockedAssistant({ section, isDetail }) {
  if (!section?.assistant) return null;
  if (section?.requiresPatient && !isDetail) return null;
  return <AiCareAssistant />;
}
