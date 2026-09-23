import { useState } from "react";
import { sendOTP, verifyOTP } from "../../../api/hospitalApi";

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OtpVerify({ onVerified, onBack }) {
  const [firstName, setFirstName] = useState("");
  const [mi, setMi] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [channel, setChannel] = useState("email");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const identifier = channel === "email" ? email.trim() : mobile.trim();

  const validateName = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setStatus({ kind: "error", text: "First and Last name are required." });
      return false;
    }
    return true;
  };

  const handleBypass = () => {
    if (!validateName()) return;
    onVerified({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      mi: mi.trim(),
      suffix: suffix.trim(),
      email: "",
      mobile_number: "",
      bypassed: true,
      verified: false,
    });
  };

  const handleSendOtp = async () => {
    if (!validateName()) return;
    if (!identifier) {
      setStatus({ kind: "error", text: channel === "email" ? "Please enter an email address." : "Please enter a mobile number with country code." });
      return;
    }
    if (channel === "email" && !emailRx.test(identifier)) {
      setStatus({ kind: "error", text: "Please enter a valid email address." });
      return;
    }
    setBusy(true);
    setStatus({ kind: "info", text: "Sending OTP…" });
    try {
      const data = await sendOTP({ identifier });
      if (data.success) {
        setOtpSent(true);
        setStatus({ kind: "ok", text: "OTP sent. Please check and enter below." });
      } else {
        setStatus({ kind: "error", text: "Failed to send OTP: " + (data.message || "Unknown error") });
      }
    } catch (err) {
      setStatus({ kind: "error", text: "Failed to send OTP: " + err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setStatus({ kind: "error", text: "Please enter the OTP." });
      return;
    }
    setBusy(true);
    setStatus({ kind: "info", text: "Verifying…" });
    try {
      const data = await verifyOTP({ identifier, otp: otp.trim() });
      if (data.verified) {
        setStatus({ kind: "ok", text: "Verified. Proceeding…" });
        onVerified({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          mi: mi.trim(),
          suffix: suffix.trim(),
          email: channel === "email" ? identifier : "",
          mobile_number: channel === "mobile" ? identifier : "",
          bypassed: false,
          verified: true,
        });
      } else {
        setStatus({ kind: "error", text: "Verification failed: " + (data.message || "Invalid OTP") });
      }
    } catch (err) {
      setStatus({ kind: "error", text: "Verification failed: " + err.message });
    } finally {
      setBusy(false);
    }
  };

  const statusColor = { ok: "text-emerald-600", error: "text-red-600", info: "text-blue-600" }[status?.kind] || "text-gray-500";

  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Step 2 of 3 · Verify New Patient</p>
      <p className="mb-4 text-sm font-semibold text-gray-800">Add New Patient</p>

      <label className="mb-1 block text-xs font-medium text-gray-600">Patient Name *</label>
      <div className="mb-3 flex gap-2">
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First" className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input value={mi} onChange={(e) => setMi(e.target.value)} placeholder="MI" maxLength={1} className="w-12 rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last" className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="Suf" maxLength={4} className="w-14 rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div className="mb-3 rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 text-center">
        <button type="button" onClick={handleBypass} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Skip Verification
        </button>
        <p className="mt-1.5 text-xs text-gray-500">Use this only if patient contact info is not available.</p>
      </div>

      <div className="my-3 text-center text-xs text-gray-400">— or verify with —</div>

      <div className="mb-3 flex gap-4">
        <label className="flex items-center gap-1.5 text-sm text-gray-700">
          <input type="radio" checked={channel === "email"} onChange={() => setChannel("email")} /> Email
        </label>
        <label className="flex items-center gap-1.5 text-sm text-gray-700">
          <input type="radio" checked={channel === "mobile"} onChange={() => setChannel("mobile")} /> Mobile
        </label>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
          <input
            type="email"
            value={email}
            disabled={channel !== "email" || otpSent}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="patient@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Mobile (with country code)</label>
          <input
            type="tel"
            value={mobile}
            disabled={channel !== "mobile" || otpSent}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="+1234567890"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSendOtp}
        disabled={busy}
        className="mb-3 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {otpSent ? "Resend OTP" : "Send OTP"}
      </button>

      {otpSent && (
        <div className="mb-3 flex gap-2">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            placeholder="6-digit code"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={busy}
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Verify
          </button>
        </div>
      )}

      {status && <p className={`mb-2 text-xs ${statusColor}`}>{status.text}</p>}

      <button type="button" onClick={onBack} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
        ← Back
      </button>
    </div>
  );
}
