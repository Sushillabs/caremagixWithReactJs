import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { X, CheckCircle2 } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { getCallDetail, sendMessage } from "../../api/hospitalApi";

export default function SendMessageModal({ onClose }) {
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patient_name = singleData?.patient_name;
  const patient_type = singleData?.patient_type;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  // Still fetched (used to show "To: <name>"), just not displayed right now
  // — see the commented-out line below.
  // eslint-disable-next-line no-unused-vars
  const [caregiverName, setCaregiverName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  // True once the lookup finished but found no phone number on file — lets
  // us show a "not found, enter manually" hint (distinct from detailsError,
  // which means the lookup call itself failed).
  const [phoneNotFound, setPhoneNotFound] = useState(false);

  const { mutate: fetchDetails, isPending: detailsPending, error: detailsError } = useMutation({ mutationFn: getCallDetail });

  const {
    mutate: send,
    isPending: isSending,
    error: sendError,
  } = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setSent(true);
      setTimeout(onClose, 1200);
    },
  });

  useEffect(() => {
    if (!patient_name || !patient_type) return;
    fetchDetails(
      { patient_type, patient_name, medication: "yes" },
      {
        onSuccess: (data) => {
          const fetchedPhone = data?.phone_number;
          const hasPhone = !!fetchedPhone && fetchedPhone.toLowerCase() !== "not available";
          setPhoneNumber(hasPhone ? fetchedPhone : "");
          setPhoneNotFound(!hasPhone);
          setCaregiverName(data?.caregiver || "");
          if (data?.message) setMessage((current) => current || data.message);
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSend = (!!phoneNumber?.trim() || !!email.trim()) && !!message.trim();

  const handleSend = () => {
    if (!canSend) return;

    send({ message, patient_number: phoneNumber, email });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[380px] rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-emerald-700">Send Message</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <CheckCircle2 size={32} className="text-emerald-600" />
            <p className="text-sm font-medium text-gray-700">Message sent!</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {/* {caregiverName && <p className="text-xs text-gray-500">To: {caregiverName}</p>} */}

            {detailsPending && <p className="text-xs text-blue-400">Looking up contact details...</p>}

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Mobile Number</label>
              <PhoneInput
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value || "")}
                defaultCountry="US"
                international
                disabled={detailsPending}
                placeholder={detailsPending ? "Looking up contact..." : "Enter mobile number"}
                className="rounded-md border border-gray-200 px-2 py-1.5 text-sm"
              />
              {detailsError && <p className="mt-1 text-xs text-red-600">Couldn't load contact details — enter it manually.</p>}
              {!detailsPending && !detailsError && phoneNotFound && (
                <p className="mt-1 text-xs text-amber-600">No mobile number on file — enter it manually.</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700"
              />
              <p className="mt-1 text-xs text-gray-400">Not on file — enter it manually if you'd like to notify by email too.</p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Type your message..."
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700"
              />
            </div>

            {sendError && <p className="text-xs text-red-600">{sendError?.response?.data?.error || "Error sending message."}</p>}

            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || detailsPending || !canSend}
              className="w-full rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
