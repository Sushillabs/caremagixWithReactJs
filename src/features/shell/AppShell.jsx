import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import DockedAssistant from "./DockedAssistant";
import { getSectionByPath } from "../../config/sections";
import useJobsTracker from "../../hooks/useJobsTracker";
import useNotifications from "../../hooks/useNotifications";
import useConnectReturn from "../../hooks/useConnectReturn";
import useMediaQuery from "../../hooks/useMediaQuery";
import Drawer from "../../components/Drawer";

export default function AppShell() {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const section = getSectionByPath(location.pathname);
  const role = useSelector((state) => state.auth?.value?.role);

  const [assistantHidden, setAssistantHidden] = useState(false);

  const isMd = useMediaQuery("(min-width: 768px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebarCollapsed") === "1";
    } catch {
      return false;
    }
  });
  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem("sidebarCollapsed", c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });
  };
  const rail = isMd && (!isLg || collapsed);
  const expandNav = isLg ? toggleCollapsed : () => setNavOpen(true);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

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
  useConnectReturn();

  const isSectionDetail = Boolean(section) && location.pathname !== section.path;
  const showSearch = section?.key === "patients" && !isSectionDetail;

  const assistantSuppressed = assistantHidden || Boolean(section?.noAssistantPaths?.some((p) => location.pathname.includes(p)));

  return (
    <div className={`grid h-dvh overflow-hidden bg-gray-100 ${!isMd ? "grid-cols-1" : rail ? "grid-cols-[4rem_1fr]" : "grid-cols-[15rem_1fr]"}`}>
      {isMd && <Sidebar rail={rail} onExpand={expandNav} onCollapse={isLg ? toggleCollapsed : undefined} />}

      <Drawer open={navOpen && !isLg} onClose={() => setNavOpen(false)} className="bg-[#0c3b2e]">
        <Sidebar />
      </Drawer>

      <div className="grid min-h-0 min-w-0 grid-rows-[auto_1fr_auto]">
        <TopBar
          onOpenNav={!isMd ? () => setNavOpen(true) : undefined}
          search={search}
          onSearchChange={setSearch}
          showSearch={showSearch}
          showPatient={!isMd && section?.key === "patients" && isSectionDetail}
          notifOpen={notifOpen}
          notifExpand={notifExpand}
          notifications={notifications}
          unreadCount={unreadCount}
          onToggleNotifications={toggleNotifications}
          onDismissNotification={dismiss}
          onMarkNotificationRead={markRead}
          onCloseNotifications={() => setNotifOpen(false)}
        />

        <main className="min-h-0 overflow-y-auto p-3 md:p-5">
          <Outlet context={{ search, section, setAssistantHidden, openNotifications }} />
        </main>

        <DockedAssistant section={section} isDetail={isSectionDetail} suppressed={assistantSuppressed} />
      </div>
    </div>
  );
}
