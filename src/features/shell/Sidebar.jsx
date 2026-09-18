import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { SECTIONS } from "../../config/sections";
import { getRoleNav } from "../../config/roles";
import { logout } from "../../redux/authSlice";
import EfaxConfigModal from "../configuration/EfaxConfigModal";
import PullPccModal from "../configuration/PullPccModal";
import PullEpicModal from "../configuration/PullEpicModal";
import ConnectMetriportModal from "../configuration/ConnectMetriportModal";
import PullMetriportModal from "../configuration/PullMetriportModal";
import ConnectEpicModal from "../configuration/ConnectEpicModal";
import EditTemplate from "../../components/EditTemplate";

// Same component as "Edit Visit Template" — only title + note_kind differ per role.
function EditHandoffNoteModal(props) {
  return <EditTemplate {...props} noteKind="handoff" title="Edit Handoff Note Template" />;
}

function EditDischargePlanTemplateModal(props) {
  return <EditTemplate {...props} noteKind="discharge" title="Edit Discharge Plan Template" />;
}

// Same component/logic as "Pull Epic Data" (physician side just calls it
// "EHR" instead of "Epic") — only the modal title differs.
function PullEhrModal(props) {
  return <PullEpicModal {...props} title="Pull EHR Data" />;
}

const CHILD_MODALS = {
  pullPcc: PullPccModal,
  connectMetriport: ConnectMetriportModal,
  pullMetriport: PullMetriportModal,
  pullEpic: PullEpicModal,
  connectEpic: ConnectEpicModal,
  pullEhr: PullEhrModal,
  efaxConfig: EfaxConfigModal,
  editVisitTemplate: EditTemplate,
  editHandoffNote: EditHandoffNoteModal,
  editDischargePlanTemplate: EditDischargePlanTemplateModal,
};

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

// Top-level section with no `path` and no `children` — opens a CHILD_MODALS
// entry directly, same registry NavGroup's modal-type children already use.
function ModalNavItem({ section }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;
  const ActiveModal = CHILD_MODALS[section.key];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm text-emerald-100/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        {Icon && <Icon size={18} className="shrink-0" />}
        <span className="truncate">{section.label}</span>
      </button>
      {open && ActiveModal && <ActiveModal onClose={() => setOpen(false)} />}
    </>
  );
}

function NavGroup({ section, role }) {
  const location = useLocation();
  const children = section.children.filter((c) => !c.roles || c.roles.includes(role));
  const [open, setOpen] = useState(children.some((c) => c.path && location.pathname.startsWith(c.path)));
  const [activeModalKey, setActiveModalKey] = useState(null);
  const Icon = section.icon;
  const ActiveModal = activeModalKey && CHILD_MODALS[activeModalKey];

  if (children.length === 0) return null;

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
          {children.map((child) =>
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
                onClick={() => CHILD_MODALS[child.key] && setActiveModalKey(child.key)}
                className="block w-full rounded-md px-2 py-1.5 text-left text-xs text-emerald-100/60 transition-colors hover:text-white"
              >
                {child.label}
              </button>
            )
          )}
        </div>
      )}
      {ActiveModal && <ActiveModal onClose={() => setActiveModalKey(null)} />}
    </div>
  );
}

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useSelector((state) => state.auth?.value?.role) || "caregiver";
  const nav = getRoleNav(role);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    // See TopBar.jsx's handleLogout — same account-switch cache leak.
    queryClient.clear();
    navigate("/");
  };

  return (
    <aside className="flex h-full w-60 flex-col bg-[#0c3b2e] text-white">
      <div className="flex items-center justify-center px-5 py-4 ">
        <img src={`${import.meta.env.BASE_URL}images/logo.png`} className="w-42.75 h-8" alt="Logo" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {nav.primary.map((key) => {
            const section = SECTIONS[key];
            if (!section) return null;
            if (section.children) return <NavGroup key={key} section={section} role={role} />;
            if (section.path) return <NavItem key={key} section={section} />;
            return <ModalNavItem key={key} section={section} />;
          })}
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
