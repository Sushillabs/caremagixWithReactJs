import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { fetchDischargePlan } from "../redux/notesSlice";

const isValidEmailFormate = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

const SendEmailModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const dispatch = useDispatch();

    const { final_template } = useSelector((state) => state.notes);
    const patientData = useSelector((state) => state?.patientsingledata?.value);

    const handleSend = async () => {
        if (!isValidEmailFormate(email)) {
            toast.error("⚠️ Enter a valid email");
            return;
        }

        const payload = {
            action: 'save_plan',
            final_template,
            patient_name: patientData?.patient_name,
            patient_type: patientData?.patient_type,
            send_email: true,
            recipient_email: email.trim(),
        };

        setIsSending(true);
        try {
            const result = await dispatch(fetchDischargePlan(payload)).unwrap();
            if (result?.email_status?.includes('success')) {
                toast.success(result.email_status);
                setEmail('');
            } else {
                toast.error(result?.email_status || 'Failed to send email');
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to send email');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white w-[90%] sm:w-[360px] rounded-xl shadow-lg flex flex-col">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <span className="font-semibold text-lg">Email Visit Note</span>
                    <button className="w-4 h-4 hover:cursor-pointer hover:bg-gray-200 rounded-full" onClick={onClose}>✕</button>
                </div>

                <div className="p-4 flex flex-col gap-2">
                    <label className="text-sm text-emerald-700">Enter Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Type here..."
                        className="w-full border rounded p-2 text-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isSending}
                        className="mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-800 text-white rounded disabled:opacity-50 hover:cursor-pointer hover:bg-emerald-900"
                    >
                        <Send size={14} />
                        {isSending ? 'Sending...' : 'Send Email'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SendEmailModal;
