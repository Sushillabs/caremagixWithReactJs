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
    noAssistantPaths: ["/care-plan", "/visit-notes"],
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

  reports: {
    key: "reports",
    label: "Call Reports",
    icon: FolderOpen,
    path: "/app/reports",
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
      { key: "pullPcc", label: "Pull PCC Data" },
      { key: "connectMetriport", label: "Connect Metriport" },
      { key: "pullMetriport", label: "Pull Metriport Data" },
      { key: "pullEpic", label: "Pull Epic Data" },
      { key: "efaxConfig", label: "Pull eFax Data" },
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

export const IMPLEMENTED_SECTIONS = ["dashboard", "patients", "jobs", "reports"];

export const getSectionByPath = (pathname) => Object.values(SECTIONS).find((s) => pathname.startsWith(s.path));
