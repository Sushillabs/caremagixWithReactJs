import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Drawer({ open, onClose, children, className = "" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] animate-slide-in-left flex-col overflow-y-auto overscroll-contain pt-safe pb-safe pl-safe shadow-xl ${className}`}
      >
        {children}
      </aside>
    </div>,
    document.body
  );
}
