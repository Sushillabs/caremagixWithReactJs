import { useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import DockedAssistant from "./DockedAssistant";
import { getSectionByPath } from "../../config/sections";
import useJobsTracker from "../../hooks/useJobsTracker";

export default function AppShell() {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const section = getSectionByPath(location.pathname);
  const role = useSelector((state) => state.auth?.value?.role);
  // Lets deeply-nested content (e.g. WellnessCheckInPanel, which has its own
  // AgentChatComposer instead of the shared AiCareAssistant) hide the docked
  // assistant without a route change — read via useOutletContext(). Path-based
  // `noAssistantPaths` can't cover this since swapping panels in place
  // doesn't change the URL.
  const [assistantHidden, setAssistantHidden] = useState(false);

  if (role === "physician") return <div className="h-dvh bg-gray-100" />;

  useJobsTracker();

  const isSectionDetail = Boolean(section) && location.pathname !== section.path;

  const assistantSuppressed = assistantHidden || Boolean(section?.noAssistantPaths?.some((p) => location.pathname.includes(p)));

  return (
    <div className="grid h-dvh grid-cols-[15rem_1fr] overflow-hidden bg-gray-100">
      <Sidebar />

      <div className="grid min-h-0 grid-rows-[auto_1fr_auto]">
        <TopBar search={search} onSearchChange={setSearch} />

        <main className="min-h-0 overflow-y-auto p-5">
          <Outlet context={{ search, section, setAssistantHidden }} />
        </main>

        <DockedAssistant section={section} isDetail={isSectionDetail} suppressed={assistantSuppressed} />
      </div>
    </div>
  );
}
