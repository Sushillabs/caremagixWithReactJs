import AiCareAssistant from "../assistant/AiCareAssistant";

// Renders the assistant only when the active section opts in (section.assistant).
// Keeps Dashboard and other overview sections free of the chat bar. For
// sections that requirePatient (e.g. patients), also wait until we're past
// the list view into a specific record (isDetail) — no assistant on
// /app/patients, only on /app/patients/:id. `suppressed` additionally hides
// it on non-chat sub-routes within an otherwise chat-enabled section (e.g.
// Care Plan) — see config/sections.js's noAssistantPaths.
export default function DockedAssistant({ section, isDetail, suppressed }) {
  if (!section?.assistant) return null;
  if (section?.requiresPatient && !isDetail) return null;
  if (suppressed) return null;
  return <AiCareAssistant />;
}
