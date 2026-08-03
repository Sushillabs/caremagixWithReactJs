import { useSelector } from "react-redux";
import { Search, Bell, ChevronDown, ChevronUp, UserCircle2, LogOut } from "lucide-react";
import { useState } from "react";

export default function TopBar({ search, onSearchChange }) {
  const auth = useSelector((state) => state.auth?.value) || {};
  const headerItem = useSelector((state) => state.auth?.item) || {};

  const facilityName = auth.hospital_name || auth.facility_name || "Care Care";
  const bedsAvailable = auth.beds_available ?? "—";
  const firstName = auth.first_name || "";
  const lastName = auth.last_name || "";
  const displayName = `${firstName} ${lastName}` || headerItem.name || auth.name || auth.username || "User";
  const role = auth.role || "";
  const [logoutShow, setLogoutShow] = useState(false);

  const handleNameClick = () => {
    setLogoutShow(!logoutShow);
  };

  const handleLogout = () => {
    // localStorage.removeItem("token");
    localStorage.clear();
    dispatch(logout());
    navigate("/");

    console.log("Logged out");
  };

  return (
    <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-5 py-3">
      {/* Patient-name search (global patient picker in later phases) */}
      <div className="relative w-full max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search patient by name"
          className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="ml-auto flex items-center gap-4 relative">
        <div className="hidden items-center gap-3 rounded-md bg-gray-50 px-3 py-1.5 text-xs sm:flex">
          <span className="text-gray-500">
            FACILITY NAME <span className="font-semibold text-gray-800">{facilityName}</span>
          </span>
          <span className="h-4 w-px bg-gray-300" />
          <span className="text-gray-500">
            BEDS AVAILABLE <span className="font-semibold text-emerald-600">{bedsAvailable}</span>
          </span>
        </div>

        <button className="relative text-gray-500 hover:text-gray-700" aria-label="Notifications">
          <Bell size={20} />
        </button>

        <button className="flex items-center gap-2 text-sm hover:cursor-pointer" onClick={handleNameClick}>
          <UserCircle2 size={26} className="text-emerald-600" />
          <span className="hidden text-left leading-tight sm:block">
            <span className="block font-medium text-gray-800">{displayName}</span>
            <span className="block text-xs capitalize text-gray-400">{role}</span>
          </span>
          {logoutShow ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {logoutShow && (
          <button
            class="px-6 py-2 text-gray-500 flex gap-2 items-center text-xs absolute right-0 top-10 border border-gray-200 bg-white rounded-sm hover:cursor-pointer"
            onClick={handleLogout}
          >
            <span>
              <LogOut size={14} />
            </span>
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
