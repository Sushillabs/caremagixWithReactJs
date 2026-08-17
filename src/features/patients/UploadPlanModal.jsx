import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { X, CheckCircle2 } from "lucide-react";
import { uploadPlan, uploadPatientImage } from "../../api/hospitalApi";
import { setJobsId } from "../../redux/jobsIdslice";

const MODE_CONFIG = {
  pdf: {
    title: "Upload Patient's Plan",
    accept: ".pdf",
    allowedExt: [".pdf"],
    fileErrorMsg: "Please choose a PDF file.",
    idleLabel: "Upload",
    pendingLabel: "Uploading...",
    planOptions: ["Discharge Plan", "Nursing Plan", "Medication Adherence", "OASIS Form"],
  },
  scan: {
    title: "Upload Scan PDF",
    accept: ".pdf,.jpg,.jpeg,.png",
    allowedExt: [".pdf", ".jpg", ".jpeg", ".png"],
    fileErrorMsg: "Please choose a PDF or image file.",
    idleLabel: "Scan",
    pendingLabel: "Starting scan...",
    planOptions: ["Care Plan", "Prescription"],
  },
};

export default function UploadPlanModal({ onClose, mode = "pdf" }) {
  const config = MODE_CONFIG[mode];
  const dispatch = useDispatch();
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patient_name = singleData?.patient_name;
  const registered_email = singleData?.patient?.raw?.registered_email;
  const registered_number = singleData?.patient?.raw?.registered_number;

  const fileInputRef = useRef(null);
  const [selectedPlan, setSelectedPlan] = useState(config.planOptions[0]);
  const [file, setFile] = useState(null);
  const [saveDocument, setSaveDocument] = useState(true);
  const [fileError, setFileError] = useState(null);
  const [done, setDone] = useState(false);
  const [doneMessage, setDoneMessage] = useState("");

  const {
    mutate: upload,
    isPending,
    error,
  } = useMutation({
    mutationFn: mode === "scan" ? uploadPatientImage : uploadPlan,
    onSuccess: (response) => {
      if (mode === "scan") {
        dispatch(setJobsId({ ocrJobs: response }));
        setDoneMessage("Scan started — we'll track its progress in the background.");
      } else {
        setDoneMessage("File uploaded successfully");
      }
      setDone(true);
      setTimeout(onClose, 1200);
    },
  });

  const isAllowedExt = (fileName) => config.allowedExt.some((ext) => fileName.toLowerCase().endsWith(ext));

  const handleFileChange = (e) => {
    const picked = e.target.files?.[0] || null;
    setFileError(picked && !isAllowedExt(picked.name) ? config.fileErrorMsg : null);
    setFile(picked);
  };

  const handleSubmit = () => {
    if (!file) {
      setFileError(config.fileErrorMsg);
      return;
    }
    if (fileError) return;

    const formData = new FormData();
    formData.append("patient_name", patient_name);
    formData.append("email", registered_email || "");
    formData.append("mobile", registered_number || "");

    if (mode === "scan") {
      formData.append("image", file);
      formData.append("image_type", selectedPlan);
      formData.append("note_doc", saveDocument ? "yes" : "no");
      formData.append("keep_document", saveDocument ? "yes" : "no");
    } else {
      formData.append("file", file);
      formData.append("file_type", "pdf");
      formData.append("patient_type", selectedPlan);
      formData.append("confirm", "false");
      formData.append("note_doc", saveDocument ? "yes" : "no");
    }

    upload(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[530px] rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-emerald-700">{config.title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <CheckCircle2 size={32} className="text-emerald-600" />
            <p className="text-sm font-medium text-gray-700">{doneMessage}</p>
          </div>
        ) : (
          <div className="space-y-5 p-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-600">Select Plan</label>
              <div className="flex gap-1">
                {config.planOptions.map((plan) => {
                  const checked = selectedPlan === plan;
                  return (
                    <label
                      key={plan}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-1 py-1.5 text-xs ${
                        checked ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={plan}
                        checked={checked}
                        onChange={() => setSelectedPlan(plan)}
                        className="h-3.5 w-3.5 accent-emerald-600"
                      />
                      {plan}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-600">Select Document</label>
              <div className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-1.5">
                <span className="truncate text-xs text-gray-500">{file?.name || "no file chosen"}</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                  className="shrink-0 rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Choose file
                </button>
                <input ref={fileInputRef} type="file" accept={config.accept} className="hidden" onChange={handleFileChange} />
              </div>
              {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={saveDocument}
                onChange={(e) => setSaveDocument(e.target.checked)}
                className="h-3.5 w-3.5 accent-emerald-600"
              />
              You want to save the document
            </label>

            <hr className="border-gray-100" />

            {error && (
              <p className="text-xs text-red-600">{error?.response?.data?.error || error?.response?.data?.message || "Error uploading file."}</p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="rounded-md bg-emerald-700 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {isPending ? config.pendingLabel : config.idleLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
