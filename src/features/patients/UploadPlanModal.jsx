import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { X, CheckCircle2 } from "lucide-react";
import { uploadPlan, uploadPatientImage } from "../../api/hospitalApi";
import { setJobsId } from "../../redux/jobsIdslice";
import { MODE_CONFIG, buildUploadFormData } from "./uploadPlanShared";
import UploadFields from "./UploadFields";

export default function UploadPlanModal({ onClose, mode = "pdf" }) {
  const config = MODE_CONFIG[mode];
  const dispatch = useDispatch();
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patient_name = singleData?.patient_name;
  const registered_email = singleData?.patient?.raw?.registered_email;
  const registered_number = singleData?.patient?.raw?.registered_number;

  const [selectedPlan, setSelectedPlan] = useState(config.planOptions[0]);
  const [file, setFile] = useState(null);
  const [saveDocument, setSaveDocument] = useState(true);
  const [fileError, setFileError] = useState(null);
  const [done, setDone] = useState(false);
  const [doneMessage, setDoneMessage] = useState("");

  const { mutate: upload, isPending, error } = useMutation({
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

  const handleFileChange = (picked, pickError) => {
    setFile(picked);
    setFileError(pickError);
  };

  const handleSubmit = () => {
    if (!file) {
      setFileError(config.fileErrorMsg);
      return;
    }
    if (fileError) return;

    upload(
      buildUploadFormData(mode, {
        file,
        plan: selectedPlan,
        saveDocument,
        patientName: patient_name,
        email: registered_email,
        mobile: registered_number,
      })
    );
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
            <UploadFields
              config={config}
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              file={file}
              onFileChange={handleFileChange}
              fileError={fileError}
              saveDocument={saveDocument}
              onToggleSaveDocument={setSaveDocument}
              disabled={isPending}
            />

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
