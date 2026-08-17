import { useState } from "react";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, CheckCircle2, Info } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { sendOTP, verifyOTP, uploadPlan, uploadPatientImage } from "../../api/hospitalApi";
import { setJobsId } from "../../redux/jobsIdslice";
import { MODE_CONFIG, buildUploadFormData } from "./uploadPlanShared";
import UploadFields from "./UploadFields";

// Backend generates a 6-digit code (verification.py: random.randint(100000, 999999)),
// not the 4 boxes shown in the Figma mockup — matching the backend, not the mockup.
const OTP_LENGTH = 6;
const emptyCode = () => Array(OTP_LENGTH).fill("");

const emptyIdentifierState = () => ({
  sent: false,
  sending: false,
  sendError: null,
  code: emptyCode(),
  verifying: false,
  verifyError: null,
  verified: false,
});

export default function AddPatientModal({ onClose }) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [step, setStep] = useState("identifiers"); // identifiers | otp | details
  const [mobile, setMobile] = useState();
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState(null);
  const [otpState, setOtpState] = useState({ mobile: emptyIdentifierState(), email: emptyIdentifierState() });

  const [uploadMode, setUploadMode] = useState("pdf");
  const [patientName, setPatientName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(MODE_CONFIG.pdf.planOptions[0]);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [saveDocument, setSaveDocument] = useState(true);
  const [done, setDone] = useState(false);
  const [doneMessage, setDoneMessage] = useState("");

  const { mutateAsync: sendOtpMutate } = useMutation({ mutationFn: sendOTP });
  const { mutateAsync: verifyOtpMutate } = useMutation({ mutationFn: verifyOTP });

  const uploadConfig = MODE_CONFIG[uploadMode];
  const {
    mutate: upload,
    isPending: isUploading,
    error: uploadError,
  } = useMutation({
    mutationFn: uploadMode === "scan" ? uploadPatientImage : uploadPlan,
    onSuccess: (response) => {
      if (uploadMode === "scan") {
        dispatch(setJobsId({ ocrJobs: response }));
        setDoneMessage("Scan started — we'll track its progress in the background.");
      } else {
        setDoneMessage("Patient added successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["patientList"] });
      setDone(true);
      setTimeout(onClose, 1200);
    },
  });

  const activeIdentifiers = [
    ...(mobile ? [{ key: "mobile", value: mobile, label: "mobile number" }] : []),
    ...(email.trim() ? [{ key: "email", value: email.trim(), label: "email" }] : []),
  ];

  const updateIdentifier = (key, patch) => setOtpState((s) => ({ ...s, [key]: { ...s[key], ...patch } }));

  const handleSendOtp = async () => {
    if (activeIdentifiers.length === 0) {
      setFormError("Enter a mobile number or email to verify.");
      return;
    }
    setFormError(null);

    const results = await Promise.all(
      activeIdentifiers.map(async ({ key, value }) => {
        updateIdentifier(key, { sending: true, sendError: null });
        try {
          await sendOtpMutate({ identifier: value });
          updateIdentifier(key, { sending: false, sent: true });
          return true;
        } catch (err) {
          const msg = err?.response?.data?.error || "Failed to send OTP.";
          updateIdentifier(key, { sending: false, sendError: msg });
          return false;
        }
      })
    );

    if (results.some(Boolean)) setStep("otp");
  };

  const handleCodeChange = (key, index, digit) => {
    if (digit && !/^\d$/.test(digit)) return;
    setOtpState((s) => {
      const code = [...s[key].code];
      code[index] = digit;
      return { ...s, [key]: { ...s[key], code, verifyError: null } };
    });
    if (digit && index < OTP_LENGTH - 1) {
      document.getElementById(`otp-${key}-${index + 1}`)?.focus();
    }
  };

  const handleCodeKeyDown = (key, index, e) => {
    if (e.key === "Backspace" && !otpState[key].code[index] && index > 0) {
      document.getElementById(`otp-${key}-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const toVerify = activeIdentifiers.filter(({ key }) => otpState[key].sent && !otpState[key].verified);

    const results = await Promise.all(
      toVerify.map(async ({ key, value }) => {
        const code = otpState[key].code.join("");
        if (code.length !== OTP_LENGTH) {
          updateIdentifier(key, { verifyError: `Enter the ${OTP_LENGTH}-digit code.` });
          return false;
        }
        updateIdentifier(key, { verifying: true, verifyError: null });
        try {
          await verifyOtpMutate({ identifier: value, otp: code });
          updateIdentifier(key, { verifying: false, verified: true });
          return true;
        } catch (err) {
          const msg = err?.response?.data?.error || "Invalid OTP.";
          updateIdentifier(key, { verifying: false, verifyError: msg });
          return false;
        }
      })
    );

    if (results.length > 0 && results.every(Boolean)) {
      setStep("details");
    }
  };

  const anyPending = activeIdentifiers.some(({ key }) => otpState[key].sending || otpState[key].verifying);

  const handleSelectUploadMode = (nextMode) => {
    setUploadMode(nextMode);
    setSelectedPlan(MODE_CONFIG[nextMode].planOptions[0]);
    setFile(null);
    setFileError(null);
  };

  const handleFileChange = (picked, pickError) => {
    setFile(picked);
    setFileError(pickError);
  };

  const handleRegister = () => {
    if (!patientName.trim()) {
      setFileError(null);
      setFormError("Enter the patient's name.");
      return;
    }
    if (!file) {
      setFileError(uploadConfig.fileErrorMsg);
      return;
    }
    if (fileError) return;
    setFormError(null);

    upload(
      buildUploadFormData(uploadMode, {
        file,
        plan: selectedPlan,
        saveDocument,
        patientName: patientName.trim(),
        email,
        mobile,
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[540px] rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-emerald-700">Register a new patient</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {step === "identifiers" && (
          <div className="space-y-4 p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Enter mobile number of patient</label>
              <PhoneInput
                value={mobile}
                onChange={setMobile}
                defaultCountry="US"
                international
                className="rounded-md border border-gray-200 px-2 py-1.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Enter E-mail ID of patient</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Type here..."
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm"
              />
            </div>

            <div className="flex items-start gap-2 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
              <Info size={14} className="mt-0.5 shrink-0" />
              To register as a patient, you must verify one OTP sent to either your mobile number or email address.
            </div>

            {formError && <p className="text-xs text-red-600">{formError}</p>}

            <hr className="border-gray-100" />

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={activeIdentifiers.some(({ key }) => otpState[key].sending)}
              className="w-full rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {activeIdentifiers.some(({ key }) => otpState[key].sending) ? "Sending..." : "Verify Via OTP"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4 p-4">
            {activeIdentifiers
              .filter(({ key }) => otpState[key].sent)
              .map(({ key, label }) => (
                <div key={key}>
                  <label className="mb-2 block text-xs font-medium text-gray-600">Enter the OTP sent to your {label}.</label>
                  <div className="flex gap-1.5">
                    {otpState[key].code.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${key}-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        disabled={otpState[key].verified}
                        onChange={(e) => handleCodeChange(key, i, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(key, i, e)}
                        className="h-9 w-9 rounded-md border border-gray-200 text-center text-sm disabled:bg-emerald-50 disabled:text-emerald-700"
                      />
                    ))}
                    {otpState[key].verified && <CheckCircle2 size={20} className="ml-1 self-center text-emerald-600" />}
                  </div>
                  {otpState[key].verifyError && <p className="mt-1 text-xs text-red-600">{otpState[key].verifyError}</p>}
                </div>
              ))}

            <hr className="border-gray-100" />

            <button
              type="button"
              onClick={handleVerify}
              disabled={anyPending}
              className="w-full rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {anyPending ? "Verifying..." : "Verify"}
            </button>
          </div>
        )}

        {step === "details" &&
          (done ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <CheckCircle2 size={32} className="text-emerald-600" />
              <p className="text-sm font-medium text-gray-700">{doneMessage}</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Enter patient first name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Type here..."
                  className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm"
                />
              </div>

              <div className="flex gap-2">
                {["pdf", "scan"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectUploadMode(m)}
                    className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium ${
                      uploadMode === m ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {m === "pdf" ? "Upload PDF" : "Upload Scan PDF"}
                  </button>
                ))}
              </div>

              <UploadFields
                config={uploadConfig}
                selectedPlan={selectedPlan}
                onSelectPlan={setSelectedPlan}
                file={file}
                onFileChange={handleFileChange}
                fileError={fileError}
                saveDocument={saveDocument}
                onToggleSaveDocument={setSaveDocument}
                disabled={isUploading}
              />

              {formError && <p className="text-xs text-red-600">{formError}</p>}
              {uploadError && (
                <p className="text-xs text-red-600">
                  {uploadError?.response?.data?.error || uploadError?.response?.data?.message || "Error uploading file."}
                </p>
              )}

              <hr className="border-gray-100" />

              <button
                type="button"
                onClick={handleRegister}
                disabled={isUploading}
                className="w-full rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {isUploading ? uploadConfig.pendingLabel : "Register"}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
