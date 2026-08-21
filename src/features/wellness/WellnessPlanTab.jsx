import { useEffect, useState } from "react";

const NYHA_OPTIONS = [
  { value: "", label: "Not sure" },
  { value: "I", label: "Class I" },
  { value: "II", label: "Class II" },
  { value: "III", label: "Class III" },
  { value: "IV", label: "Class IV" },
];

const emptyForm = {
  dry_weight_lb: "",
  daily_fluid_limit_ml: "",
  daily_sodium_limit_mg: "",
  nyha_class: "",
  preferred_check_in_time: "",
};

// The one-time (or occasional) personal-baseline form — matches legacy's
// #hfPanel-plan fields exactly (fillPlanForm/savePlan in hf_wellness.js).
// These numbers are what every future check-in's zone logic gets compared
// against, instead of a generic default.
export default function WellnessPlanTab({ profile, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      dry_weight_lb: profile.dry_weight_lb ?? "",
      daily_fluid_limit_ml: profile.daily_fluid_limit_ml ?? "",
      daily_sodium_limit_mg: profile.daily_sodium_limit_mg ?? "",
      nyha_class: profile.nyha_class || "",
      preferred_check_in_time: profile.preferred_check_in_time || "",
    });
  }, [profile]);

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err?.message || "Could not save your plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 p-3 text-xs">
      <p className="text-gray-500">
        These are the numbers your care team gave you. Filling them in lets the check-in compare today against your own targets instead of
        general ones.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-gray-600">My target (dry) weight in pounds</span>
          <input
            type="number"
            step="0.1"
            value={form.dry_weight_lb}
            onChange={handleChange("dry_weight_lb")}
            placeholder="e.g. 180"
            className="w-full rounded-md border border-gray-200 px-2 py-1.5"
          />
        </label>
        <label className="space-y-1">
          <span className="text-gray-600">Daily fluid limit in ml</span>
          <input
            type="number"
            step="50"
            value={form.daily_fluid_limit_ml}
            onChange={handleChange("daily_fluid_limit_ml")}
            placeholder="e.g. 2000"
            className="w-full rounded-md border border-gray-200 px-2 py-1.5"
          />
        </label>
        <label className="space-y-1">
          <span className="text-gray-600">Daily salt limit in mg</span>
          <input
            type="number"
            step="100"
            value={form.daily_sodium_limit_mg}
            onChange={handleChange("daily_sodium_limit_mg")}
            placeholder="e.g. 2000"
            className="w-full rounded-md border border-gray-200 px-2 py-1.5"
          />
        </label>
        <label className="space-y-1">
          <span className="text-gray-600">Heart failure class, if you know it</span>
          <select value={form.nyha_class} onChange={handleChange("nyha_class")} className="w-full rounded-md border border-gray-200 px-2 py-1.5">
            {NYHA_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-gray-600">Best time for my daily check-in</span>
          <input
            type="time"
            value={form.preferred_check_in_time}
            onChange={handleChange("preferred_check_in_time")}
            className="w-full rounded-md border border-gray-200 px-2 py-1.5"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save my plan"}
        </button>
        {saved && <span className="text-emerald-600">Saved.</span>}
        {error && <span className="text-red-600">{error}</span>}
      </div>
    </div>
  );
}
