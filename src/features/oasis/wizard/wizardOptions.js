export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
  "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC", "PR",
  "VI", "GU", "MP", "AS",
];

export const PAY_SOURCES = [
  ["M0150_CPAY_NONE", "No charge for current services"],
  ["M0150_CPAY_MCARE_FFS", "Medicare fee-for-service"],
  ["M0150_CPAY_MCARE_HMO", "Medicare HMO/managed care"],
  ["M0150_CPAY_MCAID_FFS", "Medicaid fee-for-service"],
  ["M0150_CPAY_MCAID_HMO", "Medicaid HMO/managed care"],
  ["M0150_CPAY_WRKCOMP", "Worker's compensation"],
  ["M0150_CPAY_TITLEPGMS", "Title programs"],
  ["M0150_CPAY_OTH_GOVT", "Other government"],
  ["M0150_CPAY_PRIV_INS", "Private insurance"],
  ["M0150_CPAY_PRIV_HMO", "Private HMO/managed care"],
  ["M0150_CPAY_SELFPAY", "Self-pay"],
  ["M0150_CPAY_OTHER", "Other"],
];

export const OASIS_FORM_OPTIONS = [
  { formType: "SOC", formKey: "OASIS-E2-SOC", label: "Start of Care (SOC)", built: false },
  { formType: "ROC", formKey: "OASIS-E2-ROC", label: "Resumption of Care (ROC)", built: false },
  { formType: "FU", formKey: "OASIS-E2-FU", label: "Follow-up (FU)", built: true },
  { formType: "DC", formKey: "OASIS-E2-DC", label: "Discharge (DC)", built: false },
  { formType: "DAH", formKey: "OASIS-E2-DAH", label: "Death at Home (DAH)", built: false },
  { formType: "TRN", formKey: "OASIS-E2-TRN", label: "Transfer (TRN)", built: false },
];

const ymdToISO = (ymd) => (ymd && ymd.length === 8 ? `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}` : "");
const isoToYMD = (iso) => (iso ? iso.replace(/-/g, "") : "");

export { ymdToISO, isoToYMD };
