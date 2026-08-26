export const ROLE_NAV = {
  caregiver: {
    primary: [
      "dashboard",
      "patients",
      "configurations",
      "uploads",
      "visitNotes",
      "fillForms",
      "createCarePlan",
      "alerts",
      "reports",
      "editVisitTemplate",
      "jobs",
      "configuration",
    ],
    secondary: ["dischargePlan", "nursingPlan", "transitionCarePlan", "icdCodes", "cptCodes", "medications", "uploadedPlan"],
  },
  physician: {
    primary: ["dashboard", "patients", "editHandoffNote", "manageCalendar", "configuration"],
    secondary: ["dischargePlan", "icdCodes", "cptCodes", "medications"],
  },
  patient: {
    primary: ["dashboard"],
    secondary: [],
  },
};

export const getRoleNav = (role) => ROLE_NAV[role] || ROLE_NAV.caregiver;
