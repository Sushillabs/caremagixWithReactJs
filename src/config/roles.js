// Which sections each role sees, in nav order.
// Same shell + same components everywhere; this map alone produces the
// "less or more" difference between roles. Add/remove a key to change a role.
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
      "jobs",
      "configuration",
    ],
    secondary: ["dischargePlan", "nursingPlan", "transitionCarePlan", "icdCodes", "cptCodes", "medications", "uploadedPlan"],
  },
  physician: {
    primary: ["dashboard", "patients", "createCarePlan", "alerts"],
    secondary: ["dischargePlan", "icdCodes", "cptCodes", "medications"],
  },
  patient: {
    primary: ["dashboard", "alerts"],
    secondary: [],
  },
};

export const getRoleNav = (role) => ROLE_NAV[role] || ROLE_NAV.caregiver;
