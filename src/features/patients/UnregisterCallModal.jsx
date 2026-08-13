import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { X, CheckCircle2, AlertTriangle } from "lucide-react";
import { unregisterCall } from "../../api/hospitalApi";
import { updatePatientData } from "../../redux/PatientSingleDateSlice";

export default function UnregisterCallModal({ onClose }) {
  const dispatch = useDispatch();
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const calling_number = singleData?.patient?.raw?.calling_number;
  const [done, setDone] = useState(false);

  const { mutate: unregister, isPending, error } = useMutation({
    mutationFn: unregisterCall,
    onSuccess: () => {
      dispatch(updatePatientData({ call_registered: false }));
      setDone(true);
      setTimeout(onClose, 1200);
    },
  });

  const handleUnregister = () => unregister({ to_number: calling_number });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[340px] rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-emerald-700">Unregister Call</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <CheckCircle2 size={32} className="text-emerald-600" />
            <p className="text-sm font-medium text-gray-700">Call unregistered</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
              <p>Are you sure you want to unregister this call? The scheduled call will be cancelled.</p>
            </div>

            {error && (
              <p className="text-xs text-red-600">{error?.response?.data?.error || "Error unregistering call."}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 rounded-md border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUnregister}
                disabled={isPending || !calling_number}
                className="flex-1 rounded-md bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "Unregistering..." : "Unregister"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
