import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getNotificationsStreamUrl, markAllNotificationsRead, deleteNotificationApi } from "../api/hospitalApi";

export default function useNotifications() {
  const auth = useSelector((state) => state.auth?.value) || {};
  const [notifications, setNotifications] = useState([]);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (auth.role !== "caregiver" || !auth.user_id) return;

    const source = new EventSource(getNotificationsStreamUrl(auth.user_id));
    sourceRef.current = source;

    source.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      const unread = typeof data.new_msg === "boolean" ? data.new_msg : true;

      setNotifications((prev) => {
        const idx = prev.findIndex((n) => n.id === data.msg_id);
        if (idx !== -1) {
          if (prev[idx].unread === unread) return prev;
          const next = [...prev];
          next[idx] = { ...next[idx], unread };
          return next;
        }
        const entry = {
          id: data.msg_id,
          type: data.notification_type || "system",
          title: data.patient_name || "Alert",
          message: data.message || "",
          ts: data.date ? new Date(data.date).getTime() : Date.now(),
          unread,
          patient_name: data.patient_name || "",
          to_number: data.to_number || "",
          report_path: data.report_path || "",
        };
        return [entry, ...prev];
      });
    };

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, [auth.role, auth.user_id]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    markAllNotificationsRead().catch(() => {});
  };

  const dismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteNotificationApi(id).catch(() => {});
  };

  return { notifications, unreadCount, markAllRead, dismiss };
}
