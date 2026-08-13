import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { X, Calendar, Info, CheckCircle2 } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { getCallDetail, registerCall } from "../../api/hospitalApi";
import { updatePatientData } from "../../redux/PatientSingleDateSlice";

function toDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function RegisterCallModal({ onClose }) {
  const dispatch = useDispatch();
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patient_name = singleData?.patient_name;
  const patient_type = singleData?.patient_type;
  const dates = singleData?.patient?.type === "Uploaded" ? singleData?.dates : singleData?.patient_collection;

  const [phone, setPhone] = useState();
  const [timeSlot, setTimeSlot] = useState(() => toDatetimeLocal(new Date(Date.now() + 90 * 60000)));
  const [scheduled, setScheduled] = useState(false);

  const { mutate: fetchDetails, isPending: detailsPending, error: detailsError } = useMutation({
    mutationFn: getCallDetail,
  });

  const { mutate: register, isPending: isRegistering, error: registerError } = useMutation({
    mutationFn: registerCall,
    onSuccess: () => {
      dispatch(updatePatientData({ call_registered: true, calling_number: phone }));
      setScheduled(true);
      setTimeout(onClose, 1200);
    },
  });

  useEffect(() => {
    if (!patient_name || !patient_type) return;
    fetchDetails(
      { patient_name, patient_type, dates },
      { onSuccess: (data) => setPhone(data?.phone_number) }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSchedule = () => {
    if (!phone) return;
    register({ patient_name, patient_type, dates, to_number: phone, time_slots: timeSlot });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[380px] rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-emerald-700">Register a Call</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {scheduled ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <CheckCircle2 size={32} className="text-emerald-600" />
            <p className="text-sm font-medium text-gray-700">Call scheduled</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Mobile Number</label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                defaultCountry="US"
                international
                disabled={detailsPending}
                className="rounded-md border border-gray-200 px-2 py-1.5 text-sm"
              />
              {detailsPending && <p className="mt-1 text-xs text-gray-400">Looking up phone number...</p>}
              {detailsError && (
                <p className="mt-1 text-xs text-red-600">Couldn't load phone number automatically — enter it manually.</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Schedule Time</label>
              <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1.5">
                <input
                  type="datetime-local"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full text-sm text-gray-700 outline-none"
                />
                <Calendar size={16} className="shrink-0 text-gray-400" />
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs italic text-gray-400">
                <Info size={12} className="shrink-0" /> Schedule it for 1 hour 30 minutes from now
              </p>
            </div>

            {registerError && (
              <p className="text-xs text-red-600">{registerError?.response?.data?.error || "Error registering call."}</p>
            )}

            <button
              type="button"
              onClick={handleSchedule}
              disabled={isRegistering || detailsPending || !phone}
              className="w-full rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {isRegistering ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
