import { useRef } from "react";

// JSON import (§1.12) — pseudo file-upload for whole-form state re-hydration, not a
// clinical field. Hidden native file input triggered by a styled button, matching
// legacy. `onImport` receives the parsed JSON; wiring it into form state is the
// caller's job (Phase 1, when the save/load manager exists).
export default function FileImportField({ onImport }) {
  const inputRef = useRef(null);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onImport) return;
    const text = await file.text();
    try {
      onImport(JSON.parse(text));
    } catch {
      // malformed file — nothing to hydrate, leave form state untouched
    }
    e.target.value = "";
  };

  return (
    <>
      <input ref={inputRef} type="file" accept=".json" onChange={handleChange} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50"
      >
        Import JSON
      </button>
    </>
  );
}
