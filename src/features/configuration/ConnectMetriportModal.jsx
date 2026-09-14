import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Info, CheckCircle2, Trash2 } from "lucide-react";
import { getMetriportFacility, createMetriportFacility, updateMetriportFacility, deleteMetriportFacility } from "../../api/hospitalApi";

const emptyForm = {
  name: "",
  npi: "",
  tin: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zip: "",
  country: "USA",
  active: true,
};

// GET /get-facility returns success + facility data when registered, or a
// 400 "not registered" error otherwise — that split is exactly what decides
// which of the two Figma states (empty Register form vs prefilled
// Update/Delete) this modal shows.
export default function ConnectMetriportModal({ onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState(null); // "create" | "edit" — null while loading
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { data: facilityResponse, isError: facilityLoadFailed, isLoading: isLoadingFacility } = useQuery({
    queryKey: ["metriport-facility"],
    queryFn: getMetriportFacility,
    retry: false,
  });

  useEffect(() => {
    if (isLoadingFacility) return;

    if (facilityLoadFailed || !facilityResponse?.success) {
      setMode("create");
      return;
    }

    const data = facilityResponse.data || {};
    const address = data.address || {};
    setForm({
      name: data.name || "",
      npi: data.npi || "",
      tin: data.tin || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      city: address.city || "",
      state: address.state || "",
      zip: address.zip || "",
      country: address.country || "USA",
      active: data.active !== false,
    });
    setMode("edit");
  }, [isLoadingFacility, facilityLoadFailed, facilityResponse]);

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      npi: form.npi.trim(),
      active: form.active,
      address: {
        addressLine1: form.addressLine1.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
        country: form.country.trim() || "USA",
      },
    };
    if (form.tin.trim()) payload.tin = form.tin.trim();
    if (form.addressLine2.trim()) payload.address.addressLine2 = form.addressLine2.trim();
    return payload;
  };

  const { mutate: register, isPending: isRegistering, error: registerError } = useMutation({
    mutationFn: createMetriportFacility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metriport-facility"] });
      setSuccessMessage("Facility registered successfully. Patient data will arrive shortly.");
      setTimeout(onClose, 1500);
    },
  });

  const { mutate: update, isPending: isUpdating, error: updateError } = useMutation({
    mutationFn: updateMetriportFacility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metriport-facility"] });
      setSuccessMessage("Facility updated successfully.");
      setTimeout(onClose, 1500);
    },
  });

  const { mutate: remove, isPending: isDeleting, error: deleteError } = useMutation({
    mutationFn: deleteMetriportFacility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metriport-facility"] });
      setSuccessMessage("Facility disconnected from Metriport.");
      setTimeout(onClose, 1500);
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim() || !form.npi.trim() || !form.addressLine1.trim() || !form.city.trim() || !form.state.trim() || !form.zip.trim()) {
      setFormError("Facility name, NPI, and address are required.");
      return;
    }
    setFormError(null);
    const payload = buildPayload();
    if (mode === "edit") update(payload);
    else register(payload);
  };

  const isBusy = isRegistering || isUpdating || isDeleting;
  const mutationError = registerError || updateError || deleteError;

  const field = (key, label, opts = {}) => (
    <div>
      <label className="mb-1 flex items-center justify-between text-xs font-medium text-gray-600">
        {label}
        {opts.optional && <span className="text-gray-400">Optional</span>}
      </label>
      <input
        type="text"
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={opts.placeholder}
        className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[640px] rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-emerald-700">Connect Metriport</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {isLoadingFacility || mode === null ? (
          <p className="p-8 text-center text-sm text-gray-400">Checking registration status...</p>
        ) : successMessage ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <CheckCircle2 size={32} className="text-emerald-600" />
            <p className="text-sm font-medium text-gray-700">{successMessage}</p>
          </div>
        ) : confirmingDelete ? (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-xs text-red-700">
              <Info size={14} className="mt-0.5 shrink-0" />
              Disconnect this facility from Metriport? You can register again later. Patient data via Metriport
              will stop until then.
            </div>
            {deleteError && (
              <p className="text-xs text-red-600">
                {deleteError?.response?.data?.message || deleteError?.message || "Failed to disconnect facility."}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={isDeleting}
                className="flex-1 rounded-md border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => remove()}
                disabled={isDeleting}
                className="flex-1 rounded-md bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {mode === "edit" ? (
              <div className="flex items-start gap-2 rounded-md bg-emerald-50 p-2 text-xs text-emerald-700">
                <Info size={14} className="mt-0.5 shrink-0" />
                Facility is already registered. You can update or delete the facility.
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
                <Info size={14} className="mt-0.5 shrink-0" />
                Register Facility — Connect this facility to Epic via Metriport.
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {field("name", "Facility Name", { placeholder: "e.g. Sunrise Care Facility" })}
              {field("npi", "NPI", { placeholder: "1234567890" })}
              {field("tin", "TIN", { placeholder: "12-3456789", optional: true })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {field("addressLine1", "Address Line 1", { placeholder: "Street address" })}
              {field("addressLine2", "Address Line 2", { placeholder: "Suite, unit, etc.", optional: true })}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {field("city", "City")}
              {field("state", "State")}
              {field("zip", "Zip")}
              {field("country", "Country")}
            </div>

            <label className="flex w-fit items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="h-3.5 w-3.5 accent-emerald-600"
              />
              Active
            </label>

            {formError && <p className="text-xs text-red-600">{formError}</p>}
            {mutationError && (
              <p className="text-xs text-red-600">
                {mutationError?.response?.data?.message || mutationError?.message || "Something went wrong."}
              </p>
            )}

            <hr className="border-gray-100" />

            <div className="flex items-center justify-between">
              {mode === "edit" ? (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  disabled={isBusy}
                  className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isBusy}
                className="rounded-md bg-emerald-700 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {mode === "edit" ? (isUpdating ? "Updating..." : "Update") : isRegistering ? "Registering..." : "Register Facility"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
