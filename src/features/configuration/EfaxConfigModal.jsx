import { useState } from "react";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { X, CheckCircle2, Calendar } from "lucide-react";
import { uploadEFaxConfig } from "../../api/hospitalApi";
import { setJobsId } from "../../redux/jobsIdslice";

export default function EfaxConfigModal({ onClose }) {
  const dispatch = useDispatch();
  const [originatingFaxNumber, setOriginatingFaxNumber] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [saveDischargeDoc, setSaveDischargeDoc] = useState(true);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: uploadEFaxConfig,
    onSuccess: (response) => {
      if (Array.isArray(response?.jobs) && response.jobs.length > 0) {
        dispatch(setJobsId({ eFaxJobs: response.jobs }));
      }
      setSuccessMessage(response?.message || "Fax jobs enqueued for background processing.");
    },
  });

  const handleSubmit = () => {
    setSuccessMessage(null);
    if (!originatingFaxNumber.trim() || !dateFrom || !dateTo) {
      setFormError("Originating fax number and both dates are required.");
      return;
    }
    setFormError(null);

    // Wire keys verified against Efax.py's /getfax route directly — "from"/"to",
    // not date_from/date_to. patient_type/confirm/destination_fax_number are
    // hardcoded server-side, not sent from here.
    mutate({
      originating_fax_number: originatingFaxNumber.trim(),
      from: dateFrom,
      to: dateTo,
      hospital_name: hospitalName.trim(),
      note_doc: saveDischargeDoc ? "yes" : "no",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[460px] rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-emerald-700">eFax Configuration</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Originating Fax Number</label>
            <input
              type="text"
              value={originatingFaxNumber}
              onChange={(e) => setOriginatingFaxNumber(e.target.value)}
              placeholder="Type here..."
              className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Choose Date Range</label>
            <div className="flex gap-3">
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
            <label className="mb-1 block text-xs font-medium text-gray-600">Hospital Name</label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="Type here..."
              className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700"
            />
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
          {error && (
            <p className="text-xs text-red-600">
              {error?.response?.data?.message || error?.response?.data?.error || "Error submitting eFax configuration."}
            </p>
          )}
          {successMessage && (
            <p className="flex items-center gap-1.5 text-xs text-emerald-700">
              <CheckCircle2 size={14} className="shrink-0" /> {successMessage} Track progress on the Jobs page.
            </p>
          )}

          <hr className="border-gray-100" />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
