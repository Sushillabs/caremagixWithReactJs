import { useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import DockedAssistant from "./DockedAssistant";
import { getSectionByPath } from "../../config/sections";
import useJobsTracker from "../../hooks/useJobsTracker";
import useNotifications from "../../hooks/useNotifications";
import useEpicConnectReturn from "../../hooks/useEpicConnectReturn";

export default function AppShell() {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const section = getSectionByPath(location.pathname);
  const role = useSelector((state) => state.auth?.value?.role);

  const [assistantHidden, setAssistantHidden] = useState(false);

  // Owned here (not inside TopBar) so both the bell icon and a page rendered
  // in the Outlet below (e.g. Dashboard's Medication Alerts card) can open
  // the exact same notification panel.
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifExpand, setNotifExpand] = useState(null);
  const { notifications, unreadCount, markRead, dismiss } = useNotifications();
  const openNotifications = (expandSection = null) => {
    setNotifExpand(expandSection);
    setNotifOpen(true);
  };
  const toggleNotifications = () => {
    setNotifExpand(null);
    setNotifOpen((v) => !v);
  };

  // if (role === "physician") return <div className="h-dvh bg-gray-100" />;

  useJobsTracker();
  useEpicConnectReturn();

  const isSectionDetail = Boolean(section) && location.pathname !== section.path;
  const showSearch = section?.key === "patients" && !isSectionDetail;

  const assistantSuppressed = assistantHidden || Boolean(section?.noAssistantPaths?.some((p) => location.pathname.includes(p)));

  return (
    <div className="grid h-dvh grid-cols-[15rem_1fr] overflow-hidden bg-gray-100">
      <Sidebar />

      <div className="grid min-h-0 grid-rows-[auto_1fr_auto]">
        <TopBar
          search={search}
          onSearchChange={setSearch}
          showSearch={showSearch}
          notifOpen={notifOpen}
          notifExpand={notifExpand}
          notifications={notifications}
          unreadCount={unreadCount}
          onToggleNotifications={toggleNotifications}
          onDismissNotification={dismiss}
          onMarkNotificationRead={markRead}
          onCloseNotifications={() => setNotifOpen(false)}
        />

        <main className="min-h-0 overflow-y-auto p-5">
          <Outlet context={{ search, section, setAssistantHidden, openNotifications }} />
        </main>

        <DockedAssistant section={section} isDetail={isSectionDetail} suppressed={assistantSuppressed} />
      </div>
    </div>
  );
}
