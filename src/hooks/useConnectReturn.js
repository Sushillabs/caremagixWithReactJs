import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Epic's OAuth callback sends the browser back with ?epic=connected|error.
// The app has fully reloaded by then, so this runs on boot, not in the modal.
export default function useEpicConnectReturn() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handledRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const result = params.get("epic");
    if (!result || handledRef.current) return;
    handledRef.current = true;

    if (result === "connected") {
      toast.success("Epic connected", { id: "epic-connect-toast" });
      queryClient.invalidateQueries({ queryKey: ["epic-connection"] });
    } else {
      toast.error(params.get("message") || "Epic connect failed", { id: "epic-connect-toast" });
    }

    params.delete("epic");
    params.delete("message");
    const rest = params.toString();
    navigate(`${location.pathname}${rest ? `?${rest}` : ""}`, { replace: true });
  }, [location.search, location.pathname, navigate, queryClient]);
}
