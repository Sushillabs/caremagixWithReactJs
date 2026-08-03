import AiCareAssistant from "../assistant/AiCareAssistant";

// Renders the assistant only when the active section opts in (section.assistant).
// Keeps Dashboard and other overview sections free of the chat bar.
export default function DockedAssistant({ section }) {
  if (!section?.assistant) return null;
  return <AiCareAssistant />;
}
