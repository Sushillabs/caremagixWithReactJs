// Shared between UploadPlanModal (existing patient) and AddPatientModal's
// upload step (brand-new patient) — same two backend endpoints, same field
// contracts, different source for patient_name/email/mobile.
const PLAN_OPTIONS = ["Discharge Plan", "Nursing Plan", "Medication Adherence", "OASIS Form", "Care Plan", "Prescription"];

export const MODE_CONFIG = {
  pdf: {
    title: "Upload Patient's Plan",
    accept: ".pdf",
    allowedExt: [".pdf"],
    fileErrorMsg: "Please choose a PDF file.",
    idleLabel: "Upload",
    pendingLabel: "Uploading...",
    planOptions: PLAN_OPTIONS,
  },
  scan: {
    title: "Upload Image",
    accept: ".pdf,.jpg,.jpeg,.png",
    allowedExt: [".pdf", ".jpg", ".jpeg", ".png"],
    fileErrorMsg: "Please choose a PDF or image file.",
    idleLabel: "Upload",
    pendingLabel: "Uploading...",
    planOptions: PLAN_OPTIONS,
  },
};

// Field names verified against file_upload_api.py (/upload) and
// ocr_upload_api.py (/ocr-upload) directly — the two routes use different
// field names for the same concepts (file/image, patient_type/image_type).
export function buildUploadFormData(mode, { file, plan, saveDocument, patientName, email, mobile }) {
  const formData = new FormData();
  formData.append("patient_name", patientName || "");
  formData.append("email", email || "");
  formData.append("mobile", mobile || "");

  if (mode === "scan") {
    formData.append("image", file);
    formData.append("image_type", plan);
    formData.append("note_doc", saveDocument ? "yes" : "no");
    formData.append("keep_document", saveDocument ? "yes" : "no");
  } else {
    formData.append("file", file);
    formData.append("file_type", "pdf");
    formData.append("patient_type", plan);
    formData.append("confirm", "false");
    formData.append("note_doc", saveDocument ? "yes" : "no");
  }

  return formData;
}
