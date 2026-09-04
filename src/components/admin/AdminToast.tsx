"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type ToastVariant = "success" | "error";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  leaving: boolean;
}

const TOAST_DURATION_MS = 3200;
const LEAVE_ANIMATION_MS = 180;

const AdminToastContext = createContext<
  ((message: string, variant?: ToastVariant) => void) | null
>(null);

export function AdminToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  // Portal must not render during hydration — `document` exists by the time
  // the client render runs, but not during SSR, so checking it directly in
  // render always mismatches. Flip this after mount instead.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = idRef.current++;
      setToasts((prev) => [...prev, { id, message, variant, leaving: false }]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
        );
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, LEAVE_ANIMATION_MS);
      }, TOAST_DURATION_MS);
    },
    [],
  );

  return (
    <AdminToastContext.Provider value={showToast}>
      {children}
      {mounted &&
        createPortal(
          <div className="admin-toast-root fixed bottom-20 left-1/2 z-[200] flex w-[min(360px,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2 lg:bottom-6 lg:left-auto lg:right-6 lg:translate-x-0">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`admin-toast admin-toast--${t.variant} ${
                  t.leaving ? "admin-toast--leaving" : ""
                }`}
                role="status"
              >
                <span className="admin-toast-dot" aria-hidden="true" />
                {t.message}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const showToast = useContext(AdminToastContext);
  if (!showToast) {
    throw new Error("useAdminToast must be used within AdminToastProvider");
  }
  return showToast;
}
