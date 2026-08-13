import { createContext, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const OasisModeContext = createContext({ mode: "fill", isReview: false });

/**
 * Fill vs review, read from the same `?mode=review` URL flag legacy uses — no server
 * status field exists (aerial-view doc §E/§H). Per §G this is intentionally cosmetic:
 * review does NOT lock clinical fields, only what consumes `isReview` (the Form Shell's
 * patient-name field + badge, Phase 1) chooses to gate — matching legacy exactly.
 */
export function OasisModeProvider({ children }) {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "review" ? "review" : "fill";
  const value = useMemo(() => ({ mode, isReview: mode === "review" }), [mode]);
  return <OasisModeContext.Provider value={value}>{children}</OasisModeContext.Provider>;
}

export function useOasisMode() {
  return useContext(OasisModeContext);
}
