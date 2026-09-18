import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Info, CheckCircle2, AlertTriangle, Search, Trash2 } from "lucide-react";
import {
  getEpicConnectConfig,
  getEpicConnection,
  startEpicConnect,
  disconnectEpic,
  searchEpicPatients,
} from "../../api/hospitalApi";
import useEpicUserPull from "../../hooks/useEpicUserPull";

const emptySearch = { family: "", given: "", birthdate: "" };

const msgOf = (err, fallback) => err?.response?.data?.message || err?.message || fallback;

export default function ConnectEpicModal({ onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState("main"); // "main" | "search" | "confirmDisconnect"
  const [form, setForm] = useState(emptySearch);
  const [selectedId, setSelectedId] = useState(null);
  const [pullDone, setPullDone] = useState(false);

  const { data: configRes, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["epic-connect-config"],
    queryFn: getEpicConnectConfig,
    retry: false,
  });

  const {
    data: connectionRes,
    isLoading: isLoadingConnection,
    isError: connectionFailed,
    error: connectionError,
  } = useQuery({
    queryKey: ["epic-connection"],
    queryFn: getEpicConnection,
    retry: false,
  });

  const { start, isRunning, progress, message, error: pullError } = useEpicUserPull();

  const configured = configRes?.data?.configured;
  const connection = connectionRes?.data;
  const connected = Boolean(connection?.connected);

  const { mutate: connect, isPending: isConnecting, error: connectError } = useMutation({
    // Strip any existing query string so Epic's ?epic=connected lands clean.
    mutationFn: () => startEpicConnect(window.location.href.split("?")[0]),
    onSuccess: (res) => {
      if (res?.data?.authorize_url) window.location.href = res.data.authorize_url;
    },
  });

  const { mutate: disconnect, isPending: isDisconnecting, error: disconnectError } = useMutation({
    mutationFn: disconnectEpic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["epic-connection"] });
      setView("main");
    },
  });

  const {
    mutate: runSearch,
    data: searchRes,
    isPending: isSearching,
    error: searchError,
  } = useMutation({ mutationFn: () => searchEpicPatients(form) });

  const results = searchRes?.data?.items || [];

  // progress only reaches 100 when the status poll reports "completed".
  useEffect(() => {
    if (progress === 100) setPullDone(true);
  }, [progress]);

  // "No Epic patient is in context" is not a POST error — the pull starts fine
  // and fails later on the status poll, so recover from the failure, not the call.
  useEffect(() => {
    if (pullError && pullError.toLowerCase().includes("no epic patient")) setView("search");
  }, [pullError]);

  // The sidebar (and this modal inside it) lives outside the route <Outlet>, so
  // navigating alone would leave it open on top of the Jobs page.
  useEffect(() => {
    if (!pullDone) return;
    const t = setTimeout(() => {
      onClose();
      navigate("/app/jobs");
    }, 900);
    return () => clearTimeout(t);
  }, [pullDone, navigate, onClose]);

  const handlePull = (patientIds) => {
    setPullDone(false);
    start(patientIds ? { patient_ids: patientIds } : {});
  };

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const canSearch = Boolean(form.family.trim() || form.given.trim() || form.birthdate.trim());

  const isLoading = isLoadingConfig || isLoadingConnection;
  const width = view === "search" ? "w-[460px]" : "w-[380px]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`${width} rounded-2xl bg-white shadow-lg`}>
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-emerald-700">Connect Epic</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {isLoading ? (
          <p className="p-8 text-center text-sm text-gray-400">Checking Epic connection...</p>
        ) : pullDone ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <CheckCircle2 size={32} className="text-emerald-600" />
            <p className="text-sm font-medium text-gray-700">Pull finished — taking you to the Jobs page...</p>
          </div>
        ) : configured === false ? (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Epic connect is not set up on this server. Contact support@caremagix.com to enable it for your facility.
            </div>
          </div>
        ) : view === "confirmDisconnect" ? (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Disconnect Epic for this facility? Every caregiver here will need to connect again. Patient charts
              already pulled stay in CareMagix.
            </div>
            {disconnectError && <p className="text-xs text-red-600">{msgOf(disconnectError, "Failed to disconnect.")}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView("main")}
                disabled={isDisconnecting}
                className="flex-1 rounded-md border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => disconnect()}
                disabled={isDisconnecting}
                className="flex-1 rounded-md bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          </div>
        ) : view === "search" ? (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
              <Info size={14} className="mt-0.5 shrink-0" />
              Epic needs at least a last name, first name or date of birth. Results only include patients your Epic
              login can see.
            </div>

            {pullError && <p className="text-xs text-red-600">{pullError}</p>}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Last name</label>
                <input
                  type="text"
                  value={form.family}
                  onChange={setField("family")}
                  className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">First name</label>
                <input
                  type="text"
                  value={form.given}
                  onChange={setField("given")}
                  className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Date of birth</label>
                <input
                  type="text"
                  value={form.birthdate}
                  onChange={setField("birthdate")}
                  placeholder="YYYY-MM-DD"
                  className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => runSearch()}
              disabled={!canSearch || isSearching}
              className="w-full rounded-md border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>

            {searchError && <p className="text-xs text-red-600">{msgOf(searchError, "Epic patient search failed.")}</p>}
            {searchRes && results.length === 0 && !isSearching && (
              <p className="text-xs text-gray-500">No patients matched. Try a different spelling or add a date of birth.</p>
            )}

            {results.length > 0 && (
              <div className="flex flex-col gap-2">
                {results.map((p) => (
                  <button
                    key={p.patient_id}
                    type="button"
                    onClick={() => setSelectedId(p.patient_id)}
                    className={`flex items-center justify-between rounded-lg border p-2.5 text-left ${
                      selectedId === p.patient_id ? "border-emerald-300 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-medium text-gray-700">{p.patient_name}</span>
                      <span className="block text-xs text-gray-500">
                        {[p.birth_date, p.gender].filter(Boolean).join(" · ") || "—"}
                      </span>
                    </span>
                    <span className="text-xs font-medium text-emerald-700">
                      {selectedId === p.patient_id ? "Selected" : "Select"}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <hr className="border-gray-100" />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView("main")}
                className="flex-1 rounded-md border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => handlePull([selectedId])}
                disabled={!selectedId || isRunning}
                className="flex-1 rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {isRunning ? "Pulling..." : "Pull this patient"}
              </button>
            </div>
          </div>
        ) : connected ? (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 rounded-md bg-emerald-50 p-2 text-xs text-emerald-700">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              Epic connected for this facility. Every caregiver here can pull without signing in again.
            </div>

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
              <dt className="text-gray-500">Signed in as</dt>
              <dd className="font-medium text-gray-700">{connection.practitioner_name || connection.epic_fhir_user || "—"}</dd>
              <dt className="text-gray-500">Patient in context</dt>
              <dd className="font-medium text-gray-700">{connection.epic_patient_name || "None picked at login"}</dd>
              <dt className="text-gray-500">Last pulled</dt>
              <dd className="font-medium text-gray-700">
                {connection.last_pulled_at ? new Date(connection.last_pulled_at).toLocaleString() : "Never"}
              </dd>
            </dl>

            {isRunning && <p className="text-xs text-gray-500">{message}</p>}
            {pullError && <p className="text-xs text-red-600">{pullError}</p>}

            <hr className="border-gray-100" />

            <button
              type="button"
              onClick={() => handlePull(null)}
              disabled={isRunning}
              className="w-full rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {isRunning ? "Pulling..." : "Pull Epic Data"}
            </button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setView("confirmDisconnect")}
                disabled={isRunning}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={14} /> Disconnect
              </button>
              <button
                type="button"
                onClick={() => setView("search")}
                disabled={isRunning}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                <Search size={14} /> Choose a patient
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
              <Info size={14} className="mt-0.5 shrink-0" />
              Sign in with your own Epic (Hyperspace) account. You enter your password on Epic's page, never here.
              Once connected, everyone at your facility can pull.
            </div>

            {connectionFailed && <p className="text-xs text-red-600">{msgOf(connectionError, "Could not check Epic status.")}</p>}
            {connectError && <p className="text-xs text-red-600">{msgOf(connectError, "Could not start Epic connect.")}</p>}

            <hr className="border-gray-100" />

            <button
              type="button"
              onClick={() => connect()}
              disabled={isConnecting}
              className="w-full rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {isConnecting ? "Taking you to Epic..." : "Connect Epic"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
