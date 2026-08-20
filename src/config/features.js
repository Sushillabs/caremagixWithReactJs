export const ALL_ROLES = ["caregiver", "physician", "patient"];
// const CLINICIAN_ROLES = ["caregiver", "physician"];

export const FEATURE_ROLES = {
  addPatient: ["caregiver"],
  documents: ALL_ROLES,
  plan: ALL_ROLES,
  forms: ["caregiver"],
  upload: ALL_ROLES,
  mmta: ["caregiver"],
  registerCall: ["caregiver"],
  medicationAlerts: ["caregiver"],
  medication: ALL_ROLES,
  patientJourney: ["caregiver"],
  createCarePlan: ["caregiver"],
  wellnessCheckIn: ["patient"],
  bookAppointment: ["patient"],
};

export const canUseFeature = (role, key) => (FEATURE_ROLES[key] || ALL_ROLES).includes(role);
