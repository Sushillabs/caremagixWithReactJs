import {
  LayoutDashboard,
  Users,
  Settings,
  Upload,
  StickyNote,
  FileText,
  ClipboardPlus,
  Bell,
  FolderOpen,
  FileHeart,
  Stethoscope,
  ArrowLeftRight,
  FileCode2,
  Pill,
  Files,
  CalendarClock,
  CalendarCheck,
} from "lucide-react";

export const SECTIONS = {
  // Primary navigation
  dashboard: {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/app/dashboard",
    group: "primary",
    assistant: false,
    requiresPatient: false,
  },

  patients: {
    key: "patients",
    label: "Patients",
    icon: Users,
    path: "/app/patients",
    group: "primary",
    assistant: true,
    requiresPatient: true,
    noAssistantPaths: ["/care-plan", "/visit-notes", "/mmta"],
  },

  jobs: {
    key: "jobs",
    label: "Jobs",
    icon: Files,
    path: "/app/jobs",
    group: "primary",
    assistant: false,
    requiresPatient: false,
  },

  fillForms: {
    key: "fillForms",
    label: "OASIS",
    icon: ClipboardPlus,
    path: "/app/oasis",
    group: "primary",
    assistant: false,
    requiresPatient: false,
  },

  reports: {
    key: "reports",
    label: "Call Reports",
    icon: FolderOpen,
    path: "/app/reports",
    group: "primary",
    assistant: false,
    requiresPatient: false,
  },

  // No `path`/`children` — a top-level nav item that opens a popup directly
  // (Sidebar.jsx's ModalNavItem), same CHILD_MODALS registry the
  // Configuration group's modal-type children already use.
  editVisitTemplate: {
    key: "editVisitTemplate",
    label: "Edit Visit Template",
    icon: FileText,
    group: "primary",
    assistant: false,
    requiresPatient: false,
  },
  editHandoffNote: {
    key: "editHandoffNote",
    label: "Edit Handoff Note",
    icon: FileText,
    group: "primary",
    assistant: false,
    requiresPatient: false,
  },
  editDischargePlanTemplate: {
    key: "editDischargePlanTemplate",
    label: "Edit Discharge Template",
    icon: FileText,
    group: "primary",
    assistant: false,
    requiresPatient: false,
  },

  // Real page, not a modal — this is a growing dashboard (list now, then
  // reschedule/cancel/settings/blocks), same shape as Jobs/Reports, not a
  // one-off popup like the Configuration group's modal children.
  manageCalendar: {
    key: "manageCalendar",
    label: "Manage Calendar",
    icon: CalendarClock,
    path: "/app/manage-bookings",
    group: "primary",
    assistant: false,
    requiresPatient: false,
  },

  tcm: {
    key: "tcm",
    label: "Transitional Care",
    icon: CalendarCheck,
    path: "/app/tcm",
    group: "primary",
    assistant: false,
    requiresPatient: false,
  },

  transitionCareServices: {
    key: "transitionCareServices",
    label: "Transition care services",
    icon: ArrowLeftRight,
    path: "/app/transition-care-services",
    group: "primary",
    assistant: false,
    requiresPatient: false,
  },

  configuration: {
    key: "configuration",
    label: "Configuration",
    icon: Settings,
    group: "primary",
    assistant: false,
    requiresPatient: false,

    children: [
      { key: "pullPcc", label: "Pull PCC Data", roles: ["caregiver"] },
      { key: "connectMetriport", label: "Connect HIE", roles: ["caregiver"] },
      { key: "pullMetriport", label: "Pull HIE Data", roles: ["caregiver"] },
      { key: "pullEpic", label: "Pull Epic Data", roles: ["caregiver"] },
      { key: "connectEpic", label: "Connect Epic (My Login)", roles: ["caregiver"] },
      { key: "efaxConfig", label: "Pull eFax Data", roles: ["caregiver"] },
      { key: "pullEhr", label: "Pull EHR Data", roles: ["physician"] },
    ],
  },

  // // Secondary navigation (care-plan quick links)
  // dischargePlan: {
  //   key: "dischargePlan",
  //   label: "Discharge Plan",
  //   icon: FileHeart,
  //   path: "/app/discharge-plan",
  //   group: "secondary",
  //   assistant: true,
  //   requiresPatient: true,
  // },
  // nursingPlan: {
  //   key: "nursingPlan",
  //   label: "Nursing Plan",
  //   icon: Stethoscope,
  //   path: "/app/nursing-plan",
  //   group: "secondary",
  //   assistant: true,
  //   requiresPatient: true,
  // },
  // transitionCarePlan: {
  //   key: "transitionCarePlan",
  //   label: "Transition-Care Plan",
  //   icon: ArrowLeftRight,
  //   path: "/app/transition-care-plan",
  //   group: "secondary",
  //   assistant: true,
  //   requiresPatient: true,
  // },
  // icdCodes: {
  //   key: "icdCodes",
  //   label: "ICD Codes",
  //   icon: FileCode2,
  //   path: "/app/icd-codes",
  //   group: "secondary",
  //   assistant: true,
  //   requiresPatient: true,
  // },
  // cptCodes: {
  //   key: "cptCodes",
  //   label: "CPT Codes",
  //   icon: FileCode2,
  //   path: "/app/cpt-codes",
  //   group: "secondary",
  //   assistant: true,
  //   requiresPatient: true,
  // },
  // medications: {
  //   key: "medications",
  //   label: "Medications",
  //   icon: Pill,
  //   path: "/app/medications",
  //   group: "secondary",
  //   assistant: true,
  //   requiresPatient: true,
  // },
  // uploadedPlan: {
  //   key: "uploadedPlan",
  //   label: "Uploaded Plan",
  //   icon: Files,
  //   path: "/app/uploaded-plan",
  //   group: "secondary",
  //   assistant: false,
  //   requiresPatient: true,
  // },
};

export const IMPLEMENTED_SECTIONS = ["dashboard", "patients", "jobs", "reports", "tcm"];

export const getSectionByPath = (pathname) => Object.values(SECTIONS).find((s) => pathname.startsWith(s.path));
