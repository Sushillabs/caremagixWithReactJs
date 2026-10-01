import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const PROVIDERS = [
  { param: "epic", label: "Epic", queryKey: ["epic-connection"] },
  { param: "pcc", label: "PointClickCare", queryKey: ["pcc-connection"] },
];

// The OAuth callback sends the browser back with ?epic=|?pcc=connected|error.
// The app has fully reloaded by then, so this runs on boot, not in the modal.
export default function useConnectReturn() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handledRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const provider = PROVIDERS.find((p) => params.get(p.param));
    if (!provider || handledRef.current) return;
    handledRef.current = true;

    const toastId = `${provider.param}-connect-toast`;
    if (params.get(provider.param) === "connected") {
      toast.success(`${provider.label} connected`, { id: toastId });
      queryClient.invalidateQueries({ queryKey: provider.queryKey });
    } else {
      toast.error(params.get("message") || `${provider.label} connect failed`, { id: toastId });
    }

    params.delete(provider.param);
    params.delete("message");
    const rest = params.toString();
    navigate(`${location.pathname}${rest ? `?${rest}` : ""}`, { replace: true });
  }, [location.search, location.pathname, navigate, queryClient]);
}
