import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X, CheckCircle2, Calendar } from "lucide-react";
import { uploadEFaxConfig, getEfaxSettings, saveEfaxConfig } from "../../api/hospitalApi";
import { setJobsId } from "../../redux/jobsIdslice";

export default function EfaxConfigModal({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [originatingFaxNumber, setOriginatingFaxNumber] = useState("");
  const [receivingFaxNumber, setReceivingFaxNumber] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [saveDischargeDoc, setSaveDischargeDoc] = useState(true);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [savedMessage, setSavedMessage] = useState(null);

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["efax-settings"],
    queryFn: getEfaxSettings,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (!settings) return;
    setOriginatingFaxNumber((v) => v || settings.originating_fax_number || "");
    setReceivingFaxNumber((v) => v || settings.receiving_fax_number || "");
    setHospitalName((v) => v || settings.hospital_name || "");
  }, [settings]);

  const { mutate, isPending, error, reset: resetGetFax } = useMutation({
    mutationFn: uploadEFaxConfig,
    onSuccess: (response) => {
      if (Array.isArray(response?.jobs) && response.jobs.length > 0) {
        dispatch(setJobsId({ eFaxJobs: response.jobs }));
      }
      setSuccessMessage(response?.message || "Fax jobs enqueued for background processing.");
    },
  });

  const {
    mutate: saveSettings,
    isPending: isSaving,
    error: saveError,
    reset: resetSave,
  } = useMutation({
    mutationFn: saveEfaxConfig,
    onSuccess: (response) => {
      setOriginatingFaxNumber(response?.originating_fax_number ?? originatingFaxNumber);
      setReceivingFaxNumber(response?.receiving_fax_number ?? receivingFaxNumber);
      setHospitalName(response?.hospital_name ?? hospitalName);
      setSavedMessage("Settings saved.");
    },
  });

  const saveErrorMessage = (err) => {
    const status = err?.response?.status;
    if (status === 400) return "Please fill at least one field";
    if (status === 404) return "Facility not found";
    return err?.response?.data?.message || err?.response?.data?.error || "Server error. Please try again.";
  };

  const getFaxErrorMessage = (err) => {
    const status = err?.response?.status;
    const serverMessage = err?.response?.data?.message || err?.response?.data?.error;
    if (status === 400) return serverMessage || "Enter Fax Number or Date Range";
    if (status === 404) return "No fax found for criteria";
    if (status === 409) return "All faxes already uploaded";
    if (status === 500) return "Server error. Please try again.";
    return serverMessage || "Server error. Please try again.";
  };

  const handleSaveSettings = () => {
    setSavedMessage(null);
    resetSave();
    resetGetFax();
    const orig = originatingFaxNumber.replace(/\D/g, "");
    const recv = receivingFaxNumber.replace(/\D/g, "");
    const hosp = hospitalName.trim();

    if (!originatingFaxNumber.trim() && !receivingFaxNumber.trim() && !hosp) {
      setFormError("Please fill at least one field");
      return;
    }
    const isBadFax = (raw, digits) => raw.trim() && (digits.length < 10 || digits.length > 15);
    if (isBadFax(originatingFaxNumber, orig) || isBadFax(receivingFaxNumber, recv)) {
      setFormError("Fax numbers must have 10-15 digits.");
      return;
    }
    if (hosp.length > 200) {
      setFormError("Hospital name must be 200 characters or less.");
      return;
    }
    setFormError(null);

    saveSettings({
      ...(orig && { originating_fax_number: orig }),
      ...(recv && { receiving_fax_number: recv }),
      ...(hosp && { hospital_name: hosp }),
    });
  };

  // Sidebar (and this modal, mounted inside it) lives outside the route
  // <Outlet>, so it survives navigation — closing it explicitly here is
  // required, navigate() alone would leave it open on top of the Jobs page.
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => {
      onClose();
      navigate("/app/jobs");
    }, 900);
    return () => clearTimeout(t);
  }, [successMessage, navigate, onClose]);

  const handleSubmit = () => {
    const orig = originatingFaxNumber.replace(/\D/g, "");
    const recv = receivingFaxNumber.replace(/\D/g, "");
    const hosp = hospitalName.trim();
    const hasSavedOrig = Boolean(settings?.originating_fax_number);

    if (Boolean(dateFrom) !== Boolean(dateTo)) {
      setFormError("Please select both From and To dates.");
      return;
    }
    if (dateFrom && dateFrom > dateTo) {
      setFormError("From date must be on or before To date.");
      return;
    }
    if (!orig && !hasSavedOrig && !dateFrom) {
      setFormError("Please provide a Fax Number or a Date Range.");
      return;
    }
    const isBadFax = (raw, digits) => raw.trim() && (digits.length < 10 || digits.length > 15);
    if (isBadFax(originatingFaxNumber, orig) || isBadFax(receivingFaxNumber, recv)) {
      setFormError("Fax numbers must have 10-15 digits.");
      return;
    }
    setFormError(null);
    setSavedMessage(null);
    resetSave();

    // Wire keys verified against Efax.py's /getfax route directly — "from"/"to",
    // not date_from/date_to. patient_type/confirm/destination_fax_number are
    // hardcoded server-side, not sent from here.
    mutate({
      ...(orig && { originating_fax_number: orig }),
      ...(recv && { receiving_fax_number: recv }),
      ...(dateFrom && { from: dateFrom, to: dateTo }),
      ...(hosp && { hospital_name: hosp }),
      note_doc: saveDischargeDoc ? "yes" : "no",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white pb-safe shadow-lg sm:max-h-[90dvh] sm:overflow-y-auto sm:rounded-2xl sm:w-[460px]">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-emerald-700">eFax Configuration</h2>
            {settings?.facility_name && <p className="truncate text-xs text-gray-400">{settings.facility_name}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-my-2 -mr-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 sm:m-0 sm:h-auto sm:w-auto sm:p-1"
          >
            <X size={16} className="size-5 text-gray-500 sm:size-4" />
          </button>
        </div>

        {successMessage ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <CheckCircle2 size={32} className="text-emerald-600" />
            <p className="text-sm font-medium text-gray-700">{successMessage}</p>
            <p className="text-xs text-gray-400">Taking you to the Jobs page...</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Originating Fax Number</label>
              <input
                type="text"
                value={originatingFaxNumber}
                onChange={(e) => setOriginatingFaxNumber(e.target.value)}
                placeholder={settingsLoading ? "Loading..." : "Type here..."}
                disabled={settingsLoading}
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Receiving Fax Number</label>
              <input
                type="text"
                value={receivingFaxNumber}
                onChange={(e) => setReceivingFaxNumber(e.target.value)}
                placeholder={settingsLoading ? "Loading..." : "Type here..."}
                disabled={settingsLoading}
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Hospital Name</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder={settingsLoading ? "Loading..." : "Type here..."}
                disabled={settingsLoading}
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Choose Date Range</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <span className="mb-1 block text-xs text-gray-400">From</span>
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1.5">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full text-sm text-gray-700 outline-none"
                    />
                    <Calendar size={16} className="shrink-0 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <span className="mb-1 block text-xs text-gray-400">To</span>
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1.5">
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full text-sm text-gray-700 outline-none"
                    />
                    <Calendar size={16} className="shrink-0 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-600">Save Discharge Doc</label>
              <div className="flex gap-1">
                {[
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSaveDischargeDoc(opt.value)}
                    className={`rounded-md border px-4 py-1.5 text-xs font-medium ${
                      saveDischargeDoc === opt.value ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {formError && <p className="text-xs text-red-600">{formError}</p>}
            {saveError && <p className="text-xs text-red-600">{saveErrorMessage(saveError)}</p>}
            {savedMessage && <p className="text-xs text-emerald-700">{savedMessage}</p>}
            {error && (
              <p className="text-xs text-red-600">
                {getFaxErrorMessage(error)}
              </p>
            )}

            <hr className="border-gray-100" />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving || isPending || settingsLoading}
                className="flex-1 rounded-md border border-emerald-700 bg-white py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || isSaving}
                className="flex-1 rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {isPending ? "Fetching..." : "Get Fax"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
