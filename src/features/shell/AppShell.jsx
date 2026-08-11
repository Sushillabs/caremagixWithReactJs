import { useState } from "react";
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

  useJobsTracker();

  const isSectionDetail = Boolean(section) && location.pathname !== section.path;

  const assistantSuppressed = Boolean(section?.noAssistantPaths?.some((p) => location.pathname.includes(p)));

  return (
    <div className="grid h-dvh grid-cols-[15rem_1fr] overflow-hidden bg-gray-100">
      <Sidebar />

      <div className="grid min-h-0 grid-rows-[auto_1fr_auto]">
        <TopBar search={search} onSearchChange={setSearch} />

        <main className="min-h-0 overflow-y-auto p-5">
          <Outlet context={{ search, section }} />
        </main>

        <DockedAssistant section={section} isDetail={isSectionDetail} suppressed={assistantSuppressed} />
      </div>
    </div>
  );
}
