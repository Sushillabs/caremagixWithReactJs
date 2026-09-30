import { createContext, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const OasisModeContext = createContext({ mode: "fill", isReview: false });

/**
 * Fill vs review, read from the same `?mode=review` URL flag legacy uses — no server
 * status field exists (aerial-view doc §E/§H). Review does NOT lock clinical fields;
 * `isReview` only drives the badge and whether the Form Shell applies saved answers
 * on open (fill always starts blank).
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
