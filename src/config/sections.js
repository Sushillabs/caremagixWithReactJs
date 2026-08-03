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
} from "lucide-react";

// Central registry of every section in the app shell.
// Each new feature registers here once; roles.js decides who sees it.
//   assistant       -> show the docked AI assistant while in this section
//   requiresPatient -> section needs a patient in context to be usable
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
  patients: { key: "patients", label: "Patients", icon: Users, path: "/app/patients", group: "primary", assistant: true, requiresPatient: true },
  // configurations: {
  //   key: "configurations",
  //   label: "Configurations",
  //   icon: Settings,
  //   path: "/app/configurations",
  //   group: "primary",
  //   assistant: false,
  //   requiresPatient: false,
  // },
  // uploads: { key: "uploads", label: "Uploads", icon: Upload, path: "/app/uploads", group: "primary", assistant: true, requiresPatient: true },
  // visitNotes: {
  //   key: "visitNotes",
  //   label: "Visit Notes",
  //   icon: StickyNote,
  //   path: "/app/visit-notes",
  //   group: "primary",
  //   assistant: true,
  //   requiresPatient: true,
  // },
  // fillForms: {
  //   key: "fillForms",
  //   label: "Fill Forms",
  //   icon: FileText,
  //   path: "/app/fill-forms",
  //   group: "primary",
  //   assistant: true,
  //   requiresPatient: true,
  // },
  // createCarePlan: {
  //   key: "createCarePlan",
  //   label: "Create Care Plan",
  //   icon: ClipboardPlus,
  //   path: "/app/create-care-plan",
  //   group: "primary",
  //   assistant: true,
  //   requiresPatient: true,
  // },
  // alerts: { key: "alerts", label: "Alerts", icon: Bell, path: "/app/alerts", group: "primary", assistant: false, requiresPatient: false },
  // reports: {
  //   key: "reports",
  //   label: "Others & Reports",
  //   icon: FolderOpen,
  //   path: "/app/reports",
  //   group: "primary",
  //   assistant: false,
  //   requiresPatient: false,
  // },

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

// Sections that already have a real screen built. Everything else falls back
// to the "coming soon" placeholder until its phase ships.
export const IMPLEMENTED_SECTIONS = ["dashboard", "patients"];

export const getSectionByPath = (pathname) => Object.values(SECTIONS).find((s) => pathname.startsWith(s.path));
