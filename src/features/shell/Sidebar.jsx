import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut } from "lucide-react";
import { SECTIONS } from "../../config/sections";
import { getRoleNav } from "../../config/roles";
import { logout } from "../../redux/authSlice";

function NavItem({ section }) {
  const Icon = section.icon;
  return (
    <NavLink
      to={section.path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-colors ${
          isActive ? "bg-white/15 text-white font-medium" : "text-emerald-100/80 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {Icon && <Icon size={18} className="shrink-0" />}
      <span className="truncate">{section.label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth?.value?.role) || "caregiver";
  const nav = getRoleNav(role);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/");
  };

  return (
    <aside className="flex h-full w-60 flex-col bg-[#0c3b2e] text-white">
      <div className="flex items-center justify-center px-5 py-4 ">
        <img src="../../public/images/logo.png" className="w-42.75 h-8"></img>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">{nav.primary.map((key) => SECTIONS[key] && <NavItem key={key} section={SECTIONS[key]} />)}</div>

        {nav.secondary.length > 0 && (
          <div className="mt-4 border-t border-white/10 pt-3 space-y-1">
            {nav.secondary.map(
              (key) =>
                SECTIONS[key] && (
                  <NavLink
                    key={key}
                    to={SECTIONS[key].path}
                    className={({ isActive }) =>
                      `block px-4 py-1.5 text-xs rounded-md transition-colors ${
                        isActive ? "text-white font-medium" : "text-emerald-100/60 hover:text-white"
                      }`
                    }
                  >
                    {SECTIONS[key].label}
                  </NavLink>
                )
            )}
          </div>
        )}
      </nav>

      {/* <button
        onClick={handleLogout}
        className="flex items-center gap-2 border-t border-white/10 px-5 py-3 text-sm text-emerald-100/80 hover:text-white"
      >
        <LogOut size={16} />
        Logout
      </button> */}
    </aside>
  );
}
