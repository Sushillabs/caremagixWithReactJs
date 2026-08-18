import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { SECTIONS } from "../../config/sections";
import { getRoleNav } from "../../config/roles";
import { logout } from "../../redux/authSlice";
import EfaxConfigModal from "../configuration/EfaxConfigModal";

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

// Collapsible parent — a section with `children` instead of its own `path`.
// A child with a `path` navigates (NavLink); a child without one opens as a
// modal instead — special-cased by key below, since eFax is the only one
// today. Starts open if one of its (page-type) children is the active
// route, so a hard refresh doesn't land on a collapsed group.
function NavGroup({ section }) {
  const location = useLocation();
  const [open, setOpen] = useState(section.children.some((c) => c.path && location.pathname.startsWith(c.path)));
  const [showEfaxModal, setShowEfaxModal] = useState(false);
  const Icon = section.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm text-emerald-100/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        {Icon && <Icon size={18} className="shrink-0" />}
        <span className="flex-1 truncate text-left">{section.label}</span>
        {open ? <ChevronUp size={14} className="shrink-0" /> : <ChevronDown size={14} className="shrink-0" />}
      </button>
      {open && (
        <div className="ml-4 space-y-1 border-l border-white/10 py-1 pl-3">
          {section.children.map((child) =>
            child.path ? (
              <NavLink
                key={child.key}
                to={child.path}
                className={({ isActive }) =>
                  `block rounded-md px-2 py-1.5 text-xs transition-colors ${
                    isActive ? "font-medium text-white" : "text-emerald-100/60 hover:text-white"
                  }`
                }
              >
                {child.label}
              </NavLink>
            ) : (
              <button
                key={child.key}
                type="button"
                onClick={() => child.key === "efaxConfig" && setShowEfaxModal(true)}
                className="block w-full rounded-md px-2 py-1.5 text-left text-xs text-emerald-100/60 transition-colors hover:text-white"
              >
                {child.label}
              </button>
            )
          )}
        </div>
      )}
      {showEfaxModal && <EfaxConfigModal onClose={() => setShowEfaxModal(false)} />}
    </div>
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
        <img src={`${import.meta.env.BASE_URL}images/logo.png`} className="w-42.75 h-8" alt="Logo" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {nav.primary.map(
            (key) =>
              SECTIONS[key] &&
              (SECTIONS[key].children ? <NavGroup key={key} section={SECTIONS[key]} /> : <NavItem key={key} section={SECTIONS[key]} />)
          )}
        </div>

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
