import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Bell, ChevronDown, ChevronUp, UserCircle2, LogOut, Menu, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { logout } from "../../redux/authSlice";
import NotificationDropdown from "./NotificationDropdown";

// notifOpen/notifications/etc. are owned by AppShell (not here) so a page
// rendered in its Outlet (e.g. Dashboard's Medication Alerts card) can open
// this same panel too — see AppShell.jsx.
export default function TopBar({
  search,
  onSearchChange,
  showSearch,
  notifOpen,
  notifExpand,
  notifications,
  unreadCount,
  onToggleNotifications,
  onDismissNotification,
  onMarkNotificationRead,
  onCloseNotifications,
  onOpenNav,
  showPatient,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const auth = useSelector((state) => state.auth?.value) || {};
  const headerItem = useSelector((state) => state.auth?.item) || {};
  const patient = useSelector((state) => state.patientsingledata?.value?.patient);

  const facilityName = auth.hospital_name || auth.facility_name || ": WeCare";
  const bedsAvailable = auth.beds_available ?? "—";
  const firstName = auth.first_name || "";
  const lastName = auth.last_name || "";
  const displayName = `${firstName} ${lastName}`.trim() || headerItem.name || auth.name || auth.username || "User";
  const role = auth.role || "";
  const [logoutShow, setLogoutShow] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!logoutShow) return;
    const handler = (e) => {
      if (!profileRef.current?.contains(e.target)) setLogoutShow(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [logoutShow]);

  const handleNameClick = () => {
    setLogoutShow(!logoutShow);
  };

  const handleLogout = () => {
    localStorage.clear();
    dispatch(logout());
    // Otherwise the next account to log in (same tab) can briefly see this
    // account's cached queries — e.g. /dashboard/stats keyed just
    // "dashboardStats", not scoped per-user.
    queryClient.clear();
    navigate("/");
  };

  return (
    <header className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-3 compact:py-1 md:gap-4 md:px-5">
      {onOpenNav && (
        <button type="button" onClick={onOpenNav} aria-label="Open menu" className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 compact:h-8 compact:w-8">
          <Menu size={22} />
        </button>
      )}

      {showPatient && patient && (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 compact:h-7 compact:w-7">
            <User size={16} className="text-gray-400" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-gray-800">{patient.name || "Patient"}</h2>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
            </span>
          </div>
        </div>
      )}

      {/* Patient-name search — only relevant on the patients list page */}
      {showSearch && (
        <div className="relative w-full min-w-0 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search patient by name"
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-3 relative md:gap-4">
        <div className="hidden items-center gap-3 rounded-md bg-gray-50 px-3 py-1.5 text-xs sm:flex">
          <span className="text-gray-500">
            {role === "patient" ? "Provider" : "FACILITY NAME"} <span className="font-semibold text-gray-800">{facilityName}</span>
          </span>
          {role === "caregiver" && <span className="h-4 w-px bg-gray-300" />}
          <span className="text-gray-500">
            {role === "caregiver" && (
              <>
                BEDS AVAILABLE <span className="font-semibold text-emerald-600">{bedsAvailable}</span>
              </>
            )}
          </span>
        </div>

        {role === "caregiver" && (
          <div className="relative">
            <button className="relative text-gray-500 hover:text-gray-700" aria-label="Notifications" onClick={onToggleNotifications}>
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <NotificationDropdown
                key={notifExpand || "all"}
                onlySection={notifExpand}
                notifications={notifications}
                onDismiss={onDismissNotification}
                onMarkRead={onMarkNotificationRead}
                onClose={onCloseNotifications}
              />
            )}
          </div>
        )}

        <div ref={profileRef} className="relative">
          <button
            className="flex min-h-10 items-center gap-2 text-sm hover:cursor-pointer compact:min-h-8 sm:min-h-0"
            onClick={handleNameClick}
            aria-label="Account menu"
            aria-expanded={logoutShow}
          >
            <UserCircle2 size={26} className="text-emerald-600" />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block font-medium text-gray-800">{displayName}</span>
              <span className="block text-xs capitalize text-gray-400">{role}</span>
            </span>
            {logoutShow ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {logoutShow && (
            <div className="absolute right-0 top-11 z-30 w-48 rounded-md border border-gray-200 bg-white shadow-lg sm:top-10 sm:w-auto sm:rounded-sm sm:shadow-none">
              <div className="border-b border-gray-100 px-3 py-2 sm:hidden">
                <p className="truncate text-sm font-medium text-gray-800">{displayName}</p>
                <p className="text-xs capitalize text-gray-400">{role}</p>
              </div>
              <button
                className="flex min-h-11 w-full items-center gap-2 px-3 text-sm text-gray-600 hover:cursor-pointer active:bg-gray-50 sm:min-h-0 sm:px-6 sm:py-2 sm:text-xs sm:text-gray-500"
                onClick={handleLogout}
              >
                <span>
                  <LogOut size={14} />
                </span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
