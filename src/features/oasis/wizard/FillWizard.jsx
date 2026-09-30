import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import PatientPicker from "./PatientPicker";
import OtpVerify from "./OtpVerify";
import PrefillDemographics from "./PrefillDemographics";
import { getOasisForm, saveOasisForm } from "../api/oasisApi";
import { OASIS_FORM_OPTIONS } from "./wizardOptions";

export default function FillWizard({ onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("pickForm");
  const [formOption, setFormOption] = useState(null);
  const [wizardState, setWizardState] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const handlePickForm = (option) => {
    setFormOption(option);
    setWizardState({
      patient_id: null,
      patient_name: "",
      first_name: "",
      last_name: "",
      mi: "",
      suffix: "",
      email: "",
      mobile_number: "",
      new_patient: false,
      is_existing: false,
      prefill_data: {},
    });
    setStep("picker");
  };

  const handlePickExisting = async (patient) => {
    setLoadingExisting(true);
    let hasSavedForm = false;
    try {
      const data = await getOasisForm({
        patient_id: patient.patient_id,
        patient_name: patient.patient_name,
        form_name: formOption.formKey,
      });
      hasSavedForm = Object.values(data?.mapped_data || {}).some((v) => v !== "" && v != null);
      const pd = data?.patient_details || {};
      setWizardState({
        patient_id: patient.patient_id,
        patient_name: patient.patient_name,
        first_name: pd.M0040_first || patient.patient_name.split(" ")[0] || "",
        last_name: pd.M0040_last || patient.patient_name.split(" ").slice(-1)[0] || "",
        mi: pd.M0040_mi || "",
        suffix: pd.M0040_suffix || "",
        email: data?.email || "",
        mobile_number: data?.mobile_number || "",
        new_patient: false,
        is_existing: true,
        prefill_data: pd,
      });
    } catch {
      const parts = patient.patient_name.split(" ");
      setWizardState({
        patient_id: patient.patient_id,
        patient_name: patient.patient_name,
        first_name: parts[0] || "",
        last_name: parts.slice(-1)[0] || "",
        mi: "",
        suffix: "",
        email: "",
        mobile_number: "",
        new_patient: false,
        is_existing: true,
        prefill_data: {},
      });
    }
    setLoadingExisting(false);
    setStep(hasSavedForm ? "confirmReplace" : "prefill");
  };

  const handleAddNew = () => {
    setWizardState((s) => ({ ...s, patient_id: null, new_patient: true, is_existing: false }));
    setStep("otp");
  };

  const handleVerified = (nameInfo) => {
    setWizardState((s) => ({ ...s, ...nameInfo }));
    setStep("prefill");
  };

  const handleSubmitPrefill = async ({ patientName, patientDetails }) => {
    const payload = {
      patient_name: patientName,
      patient_id: wizardState.patient_id,
      new_patient: wizardState.new_patient,
      patient_details: patientDetails,
      email: wizardState.email || null,
      mobile_number: wizardState.mobile_number || null,
    };
    const data = await saveOasisForm(payload);
    const newId = data?.patient_id || wizardState.patient_id;
    const savedName = data?.patient_name || patientName;

    const params = new URLSearchParams({ patient_id: newId || "", patient_name: savedName, mode: "fill" });
    onClose();
    navigate(`/app/oasis/${formOption.formType.toLowerCase()}?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">OASIS — New Assessment</span>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {step === "pickForm" && (
          <div>
            <p className="mb-3 text-sm font-semibold text-gray-800">Choose Assessment Type</p>
            <div className="space-y-2">
              {OASIS_FORM_OPTIONS.map((opt) => (
                <button
                  key={opt.formType}
                  type="button"
                  disabled={!opt.built}
                  onClick={() => handlePickForm(opt)}
                  className="flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>{opt.label}</span>
                  {!opt.built && <span className="text-xs text-gray-400">Not built yet</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "picker" && <PatientPicker onPickExisting={handlePickExisting} onAddNew={handleAddNew} />}

        {loadingExisting && <p className="py-6 text-center text-sm text-gray-500">Loading patient data…</p>}

        {step === "confirmReplace" && wizardState && (
          <div>
            <p className="mb-3 text-sm font-semibold text-gray-800">Replace saved {formOption.formType}?</p>
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              <span className="font-medium">{wizardState.patient_name}</span> already has a saved {formOption.label}.
              Starting a new assessment will replace it when you save. To see or change the saved one, open Review
              from the patient page instead.
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setStep("picker")}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep("prefill")}
                className="flex-1 rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                Start new and replace
              </button>
            </div>
          </div>
        )}

        {step === "otp" && !loadingExisting && <OtpVerify onVerified={handleVerified} onBack={() => setStep("picker")} />}

        {step === "prefill" && !loadingExisting && wizardState && (
          <PrefillDemographics
            formLabel={formOption?.label}
            isExisting={wizardState.is_existing}
            initialName={wizardState}
            initialPatientDetails={wizardState.prefill_data}
            onBack={() => setStep("picker")}
            onSubmit={handleSubmitPrefill}
          />
        )}
      </div>
    </div>
  );
}
