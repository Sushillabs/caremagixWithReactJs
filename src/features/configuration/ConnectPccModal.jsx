import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Info, CheckCircle2, AlertTriangle, Search, Trash2, Pencil, Building2 } from "lucide-react";
import {
  getPccConnectConfig,
  getPccActivations,
  getPccConnection,
  savePccSettings,
  startPccConnect,
  disconnectPcc,
  getPccFacilities,
  searchPccPatients,
} from "../../api/hospitalApi";
import usePccUserPull from "../../hooks/usePccUserPull";

const PATIENT_STATUSES = ["Current", "New", "Discharged"];

const msgOf = (err, fallback) => err?.response?.data?.message || err?.message || fallback;

const inputCls = "w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700";
const primaryBtn =
  "flex-1 rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50";
const secondaryBtn =
  "flex-1 rounded-md border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50";
const linkBtn = "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50";

export default function ConnectPccModal({ onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState("main"); // "main" | "settings" | "facilities" | "patients" | "confirmDisconnect"
  const [settingsDraft, setSettingsDraft] = useState(null);
  const [patientSearch, setPatientSearch] = useState({ name: "", patient_status: "Current" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [pullDone, setPullDone] = useState(false);

  const { data: configRes, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["pcc-connect-config"],
    queryFn: getPccConnectConfig,
    retry: false,
  });

  const {
    data: connectionRes,
    isLoading: isLoadingConnection,
    isError: connectionFailed,
    error: connectionError,
  } = useQuery({
    queryKey: ["pcc-connection"],
    queryFn: getPccConnection,
    retry: false,
  });

  const { start, isRunning, showProgress, progress, message, error: pullError } = usePccUserPull();

  const configured = configRes?.data?.configured;
  const connection = connectionRes?.data;
  const connected = Boolean(connection?.connected);
  const settingsSaved = Boolean(connection?.settings_saved);
  const savedOrg = connection?.org_uuid || "";
  const showSettings = view === "settings" || (!settingsSaved && view === "main");

  const { data: activationsRes, isLoading: isLoadingActivations } = useQuery({
    queryKey: ["pcc-activations"],
    queryFn: getPccActivations,
    enabled: showSettings && configured !== false,
    retry: false,
  });
  const activations = activationsRes?.data?.organizations || [];

  const {
    data: facilitiesRes,
    isLoading: isLoadingFacilities,
    error: facilitiesError,
  } = useQuery({
    queryKey: ["pcc-facilities"],
    queryFn: getPccFacilities,
    enabled: view === "facilities" && connected,
    retry: false,
  });
  const facilities = facilitiesRes?.data?.facilities || [];

  const savedSettings = {
    org_uuid: savedOrg,
    org_name: connection?.org_name || "",
    fac_id: connection?.fac_id || "",
    pcc_facility_name: connection?.pcc_facility_name || "",
  };
  const settings = settingsDraft ?? savedSettings;
  const orgChanged = connected && settings.org_uuid.trim() !== savedOrg;

  const goMain = () => {
    setSettingsDraft(null);
    setView("main");
  };

  const applySaved = (res) => {
    queryClient.setQueryData(["pcc-connection"], (old) => ({ ...old, data: { ...old?.data, ...res?.data } }));
    queryClient.invalidateQueries({ queryKey: ["pcc-connection"] });
  };

  const {
    mutate: saveSettings,
    isPending: isSavingSettings,
    error: saveSettingsError,
    reset: resetSaveSettings,
  } = useMutation({
    mutationFn: () =>
      savePccSettings({
        org_uuid: settings.org_uuid.trim(),
        org_name: settings.org_name.trim(),
        fac_id: String(settings.fac_id ?? "").trim(),
        ...(settings.pcc_facility_name ? { pcc_facility_name: settings.pcc_facility_name } : {}),
      }),
    onSuccess: (res) => {
      applySaved(res);
      goMain();
    },
  });

  const {
    mutate: switchFacility,
    isPending: isSwitchingFacility,
    variables: switchingTo,
    error: switchFacilityError,
  } = useMutation({
    mutationFn: (fac) =>
      savePccSettings({ org_uuid: savedOrg, fac_id: String(fac.fac_id), pcc_facility_name: fac.facility_name || "" }),
    onSuccess: (res) => {
      applySaved(res);
      setView("main");
    },
  });

  const { mutate: connect, isPending: isConnecting, error: connectError } = useMutation({
    mutationFn: () => startPccConnect(window.location.href.split("?")[0]),
    onSuccess: (res) => {
      if (res?.data?.authorize_url) window.location.href = res.data.authorize_url;
    },
  });

  const { mutate: disconnect, isPending: isDisconnecting, error: disconnectError } = useMutation({
    mutationFn: disconnectPcc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pcc-connection"] });
      setView("main");
    },
  });

  const {
    mutate: runSearch,
    data: searchRes,
    isPending: isSearching,
    error: searchError,
  } = useMutation({
    mutationFn: () => searchPccPatients(patientSearch),
    onSuccess: () => setSelectedIds([]),
  });
  const patients = searchRes?.data?.patients || [];

  useEffect(() => {
    if (progress === 100) setPullDone(true);
  }, [progress]);

  useEffect(() => {
    const msg = (pullError || "").toLowerCase();
    if (msg.includes("organization uuid")) setView("settings");
    else if (msg.includes("connect")) queryClient.invalidateQueries({ queryKey: ["pcc-connection"] });
  }, [pullError, queryClient]);

  useEffect(() => {
    if (msgOf(connectError, "").toLowerCase().includes("organization uuid")) setView("settings");
  }, [connectError]);

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
    start(patientIds?.length ? { patient_ids: patientIds } : {});
  };

  const setSettingField = (key) => (e) =>
    setSettingsDraft((s) => ({ ...(s ?? savedSettings), [key]: e.target.value }));

  const pickActivation = (org, fac) =>
    setSettingsDraft({
      org_uuid: org.org_uuid || "",
      org_name: org.org_name || "",
      fac_id: fac?.fac_id ? String(fac.fac_id) : "",
      pcc_facility_name: fac?.facility_name || "",
    });

  const toggleSelected = (id) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const isLoading = isLoadingConfig || isLoadingConnection;
  const width = view === "patients" || showSettings ? "w-[460px]" : "w-[420px]";
  const buildingLabel = connection?.pcc_facility_name
    ? `${connection.pcc_facility_name} (${connection.fac_id})`
    : connection?.fac_id || "Not selected";

  const progressBar = showProgress && (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span className="truncate">{message}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div className="h-1.5 rounded-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`${width} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-lg`}>
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-emerald-700">Connect PointClickCare</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {isLoading ? (
          <p className="p-8 text-center text-sm text-gray-400">Checking PointClickCare connection...</p>
        ) : pullDone ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <CheckCircle2 size={32} className="text-emerald-600" />
            <p className="text-sm font-medium text-gray-700">Pull finished — taking you to the Jobs page...</p>
          </div>
        ) : configured === false ? (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              PointClickCare is not set up on the server. Contact support@caremagix.com to enable it for your
              facility.
            </div>
          </div>
        ) : view === "confirmDisconnect" ? (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Disconnect PointClickCare for this facility? Every caregiver here will need to connect again. The saved
              organization and pulled charts stay.
            </div>
            {disconnectError && <p className="text-xs text-red-600">{msgOf(disconnectError, "Failed to disconnect.")}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setView("main")} disabled={isDisconnecting} className={secondaryBtn}>
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
        ) : showSettings ? (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
              <Info size={14} className="mt-0.5 shrink-0" />
              Save your PointClickCare organization once. Every caregiver at this facility will use it.
            </div>

            {connectionFailed && (
              <p className="text-xs text-red-600">{msgOf(connectionError, "Could not check PointClickCare status.")}</p>
            )}

            {isLoadingActivations ? (
              <p className="text-xs text-gray-400">Loading organizations...</p>
            ) : (
              activations.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-600">Pick your organization</p>
                  <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
                    {activations.flatMap((org) => {
                      const facs = org.facilities?.length ? org.facilities : [null];
                      return facs.map((fac) => {
                        const selected =
                          settings.org_uuid === org.org_uuid && String(settings.fac_id || "") === String(fac?.fac_id || "");
                        return (
                          <button
                            key={`${org.org_uuid}-${fac?.fac_id ?? "none"}`}
                            type="button"
                            onClick={() => pickActivation(org, fac)}
                            className={`rounded-lg border p-2 text-left text-xs ${
                              selected ? "border-emerald-300 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <span className="block font-medium text-gray-700">{org.org_name || org.org_uuid}</span>
                            <span className="block text-gray-500">
                              {fac ? `${fac.facility_name || "Building"} · ID ${fac.fac_id}` : "No buildings listed"}
                            </span>
                          </button>
                        );
                      });
                    })}
                  </div>
                </div>
              )
            )}

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Organization UUID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.org_uuid}
                  onChange={setSettingField("org_uuid")}
                  placeholder="da2f11ce-ca44-491b-82e4-01d6e1f1b303"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Organization name</label>
                <input
                  type="text"
                  value={settings.org_name}
                  onChange={setSettingField("org_name")}
                  placeholder="Optional"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Facility ID</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={settings.fac_id}
                  onChange={setSettingField("fac_id")}
                  placeholder="Optional building id, e.g. 12"
                  className={inputCls}
                />
              </div>
            </div>

            {orgChanged && (
              <div className="flex items-start gap-2 rounded-md bg-amber-50 p-2 text-xs text-amber-700">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                Changing the organization signs PointClickCare out for this facility. You will need to connect again.
              </div>
            )}

            {saveSettingsError && (
              <p className="text-xs text-red-600">{msgOf(saveSettingsError, "Failed to save PointClickCare organization.")}</p>
            )}

            <hr className="border-gray-100" />

            <div className="flex gap-2">
              {settingsSaved && (
                <button
                  type="button"
                  onClick={() => {
                    resetSaveSettings();
                    goMain();
                  }}
                  disabled={isSavingSettings}
                  className={secondaryBtn}
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={() => saveSettings()}
                disabled={!settings.org_uuid.trim() || isSavingSettings}
                className={primaryBtn}
              >
                {isSavingSettings ? "Saving..." : "Save PointClickCare organization"}
              </button>
            </div>
          </div>
        ) : view === "facilities" ? (
          <div className="space-y-4 p-4">
            <p className="text-xs text-gray-500">Pick the building to pull patients from. You stay connected.</p>

            {isLoadingFacilities && <p className="text-xs text-gray-400">Loading buildings...</p>}
            {facilitiesError && <p className="text-xs text-red-600">{msgOf(facilitiesError, "Could not load buildings.")}</p>}
            {switchFacilityError && (
              <p className="text-xs text-red-600">{msgOf(switchFacilityError, "Could not change building.")}</p>
            )}
            {!isLoadingFacilities && !facilitiesError && facilities.length === 0 && (
              <p className="text-xs text-gray-500">No buildings found for this organization.</p>
            )}

            <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
              {facilities.map((fac) => {
                const current = String(fac.fac_id) === String(connection?.fac_id || "");
                const switching = isSwitchingFacility && switchingTo?.fac_id === fac.fac_id;
                return (
                  <button
                    key={fac.fac_id}
                    type="button"
                    onClick={() => !current && switchFacility(fac)}
                    disabled={isSwitchingFacility}
                    className={`flex items-center justify-between rounded-lg border p-2.5 text-left disabled:opacity-60 ${
                      current ? "border-emerald-300 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-medium text-gray-700">{fac.facility_name || `Building ${fac.fac_id}`}</span>
                      <span className="block text-xs text-gray-500">
                        {[`ID ${fac.fac_id}`, [fac.city, fac.state].filter(Boolean).join(", "), fac.active === false && "Inactive"]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    <span className="text-xs font-medium text-emerald-700">
                      {current ? "Current" : switching ? "Saving..." : "Select"}
                    </span>
                  </button>
                );
              })}
            </div>

            <hr className="border-gray-100" />
            <button type="button" onClick={() => setView("main")} className={`w-full ${secondaryBtn}`}>
              Back
            </button>
          </div>
        ) : view === "patients" ? (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
              <Info size={14} className="mt-0.5 shrink-0" />
              Search the census at {buildingLabel}, then pick the patients to pull.
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
                <input
                  type="text"
                  value={patientSearch.name}
                  onChange={(e) => setPatientSearch((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Optional"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
                <select
                  value={patientSearch.patient_status}
                  onChange={(e) => setPatientSearch((s) => ({ ...s, patient_status: e.target.value }))}
                  className={inputCls}
                >
                  {PATIENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="button" onClick={() => runSearch()} disabled={isSearching} className={`w-full ${secondaryBtn}`}>
              {isSearching ? "Searching..." : "Search"}
            </button>

            {searchError && <p className="text-xs text-red-600">{msgOf(searchError, "PointClickCare patient search failed.")}</p>}
            {searchRes && patients.length === 0 && !isSearching && (
              <p className="text-xs text-gray-500">No patients matched.</p>
            )}

            {patients.length > 0 && (
              <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                {patients.map((p) => {
                  const selected = selectedIds.includes(p.patient_id);
                  return (
                    <button
                      key={p.patient_id}
                      type="button"
                      onClick={() => toggleSelected(p.patient_id)}
                      className={`flex items-center justify-between rounded-lg border p-2.5 text-left ${
                        selected ? "border-emerald-300 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-medium text-gray-700">{p.patient_name}</span>
                        <span className="block text-xs text-gray-500">
                          {[p.birth_date, p.patient_status].filter(Boolean).join(" · ") || "—"}
                        </span>
                      </span>
                      <input type="checkbox" readOnly checked={selected} className="accent-emerald-700" />
                    </button>
                  );
                })}
              </div>
            )}

            {progressBar}
            {pullError && <p className="text-xs text-red-600">{pullError}</p>}

            <hr className="border-gray-100" />

            <div className="flex gap-2">
              <button type="button" onClick={() => setView("main")} disabled={isRunning} className={secondaryBtn}>
                Back
              </button>
              <button
                type="button"
                onClick={() => handlePull(selectedIds)}
                disabled={!selectedIds.length || isRunning}
                className={primaryBtn}
              >
                {isRunning ? "Pulling..." : `Pull ${selectedIds.length || ""} patient${selectedIds.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        ) : connected ? (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 rounded-md bg-emerald-50 p-2 text-xs text-emerald-700">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              PointClickCare connected for this facility. Every caregiver here can pull without signing in again.
            </div>

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
              <dt className="text-gray-500">Organization</dt>
              <dd className="break-all font-medium text-gray-700">{connection.org_name || savedOrg || "—"}</dd>
              <dt className="text-gray-500">Building</dt>
              <dd className="font-medium text-gray-700">{buildingLabel}</dd>
              <dt className="text-gray-500">Signed in as</dt>
              <dd className="font-medium text-gray-700">{connection.pcc_user_name || connection.pcc_username || "—"}</dd>
              <dt className="text-gray-500">Last pulled</dt>
              <dd className="font-medium text-gray-700">
                {connection.last_pulled_at ? new Date(connection.last_pulled_at).toLocaleString() : "Never"}
              </dd>
            </dl>

            {progressBar}
            {pullError && <p className="text-xs text-red-600">{pullError}</p>}

            <hr className="border-gray-100" />

            <button type="button" onClick={() => handlePull()} disabled={isRunning} className={`w-full ${primaryBtn}`}>
              {isRunning ? "Pulling..." : "Pull PointClickCare Data"}
            </button>

            <div className="flex flex-wrap items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => setView("confirmDisconnect")}
                disabled={isRunning}
                className={`${linkBtn} text-red-600 hover:bg-red-50`}
              >
                <Trash2 size={14} /> Disconnect
              </button>
              <button
                type="button"
                onClick={() => setView("facilities")}
                disabled={isRunning}
                className={`${linkBtn} text-gray-600 hover:bg-gray-50`}
              >
                <Building2 size={14} /> Change building
              </button>
              <button
                type="button"
                onClick={() => setView("patients")}
                disabled={isRunning}
                className={`${linkBtn} text-emerald-700 hover:bg-emerald-50`}
              >
                <Search size={14} /> Choose patients
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
              <Info size={14} className="mt-0.5 shrink-0" />
              Sign in with your own PointClickCare account. You enter your password on PointClickCare's page, never
              here. Once connected, everyone at your facility can pull.
            </div>

            <div className="flex items-start justify-between gap-3 rounded-md border border-gray-100 p-2.5 text-xs">
              <span className="min-w-0">
                <span className="block font-medium text-gray-700">{connection?.org_name || "Saved organization"}</span>
                <span className="block break-all text-gray-500">{savedOrg}</span>
                <span className="block text-gray-500">Building: {buildingLabel}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSettingsDraft(null);
                  setView("settings");
                }}
                className="flex shrink-0 items-center gap-1 font-medium text-emerald-700 hover:underline"
              >
                <Pencil size={12} /> Edit
              </button>
            </div>

            {connectionFailed && (
              <p className="text-xs text-red-600">{msgOf(connectionError, "Could not check PointClickCare status.")}</p>
            )}
            {connectError && <p className="text-xs text-red-600">{msgOf(connectError, "Could not start PointClickCare connect.")}</p>}
            {pullError && <p className="text-xs text-red-600">{pullError}</p>}

            <hr className="border-gray-100" />

            <button type="button" onClick={() => connect()} disabled={isConnecting} className={`w-full ${primaryBtn}`}>
              {isConnecting ? "Taking you to PointClickCare..." : "Connect PointClickCare"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
