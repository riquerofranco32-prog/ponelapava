"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function AdminModal({
  title,
  onClose,
  children,
  footer,
  maxWidth = 480,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Focus trap + Escape + restore focus on close
  useEffect(() => {
    const previouslyFocused = document.activeElement;

    function getFocusable(): HTMLElement[] {
      return Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));
    }

    getFocusable()[0]?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  // Portal to document.body so position:fixed positions against the
  // viewport, not a transformed ancestor.
  return createPortal(
    <div
      className="pava-admin admin-modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="admin-modal-dialog"
        style={{
          width: "100%",
          maxWidth,
          maxHeight: "92dvh",
          background: "var(--dash-surface)",
          border: "1px solid var(--dash-border)",
          borderRadius: 14,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="admin-modal-handle">
          <span />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--dash-border)",
            flexShrink: 0,
          }}
        >
          <h2
            style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text)" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="admin-icon-btn"
            style={{ width: 32, height: 32, borderRadius: "50%" }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflowY: "auto",
          }}
        >
          {children}
        </div>

        {footer && (
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid var(--dash-border)",
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
