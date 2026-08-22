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
      "editVisitTemplate",
      "jobs",
      "transitionCareServices",
      "configuration",
    ],
    secondary: ["dischargePlan", "nursingPlan", "transitionCarePlan", "icdCodes", "cptCodes", "medications", "uploadedPlan"],
  },
  physician: {
    primary: ["dashboard", "patients"],
    secondary: ["dischargePlan", "icdCodes", "cptCodes", "medications"],
  },
  patient: {
    // "patients" list is intentionally left out of nav — patient role has no
    // roster to browse, their own record now opens straight from the
    // dashboard. Route + PatientsList component are untouched, still
    // reachable directly and still used by caregiver/physician nav.
    primary: ["dashboard"],
    secondary: [],
  },
};

export const getRoleNav = (role) => ROLE_NAV[role] || ROLE_NAV.caregiver;
