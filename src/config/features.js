export const ALL_ROLES = ["caregiver", "physician", "patient"];
// const CLINICIAN_ROLES = ["caregiver", "physician"];

export const FEATURE_ROLES = {
  addPatient: ["caregiver"],
  notes: ["caregiver", "physician"],
  documents: ["caregiver", "patient"],
  plan: ["caregiver", "patient"],
  forms: ["caregiver"],
  upload: ["caregiver"],
  mmta: ["caregiver"],
  registerCall: ["caregiver"],
  medicationAlerts: ["caregiver", "physician"],
  medication: ["caregiver", "patient"],
  patientJourney: ["caregiver"],
  createCarePlan: ["caregiver"],
  wellnessCheckIn: ["patient"],
  bookAppointment: ["patient"],
  wellnessCheckInReport: ["caregiver"],
  createProgressNotes: ["physician"],
};

export const canUseFeature = (role, key) => (FEATURE_ROLES[key] || ALL_ROLES).includes(role);
