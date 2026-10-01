import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { logout, tokenExpiresAt } from "../redux/authSlice";
import { SESSION_EXPIRED_EVENT } from "../api/httpClient";

const MAX_TIMEOUT_MS = 2147483647;

export default function useSessionExpiry() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = useSelector((state) => state.auth.value?.token);

  const expire = useCallback(() => {
    if (!localStorage.getItem("token")) return;
    localStorage.clear();
    dispatch(logout());
    queryClient.clear();
    toast.error("Your session expired. Please log in again.", { id: "session-expired" });
  }, [dispatch, queryClient]);

  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, expire);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expire);
  }, [expire]);

  useEffect(() => {
    const expiresAt = token ? tokenExpiresAt(token) : null;
    if (expiresAt === null) return;
    const t = setTimeout(expire, Math.min(MAX_TIMEOUT_MS, Math.max(0, expiresAt - Date.now())));
    return () => clearTimeout(t);
  }, [token, expire]);
}
