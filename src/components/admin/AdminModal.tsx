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
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Background stays scrollable otherwise — same lock AdminShell uses for
  // its mobile nav, needed here too since every admin modal is a portal
  // outside the shell's own scroll container.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
      className="pava-admin admin-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="admin-modal-dialog w-full max-h-[92dvh] bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[14px] overflow-hidden flex flex-col"
        style={{ maxWidth }}
      >
        <div className="admin-modal-handle">
          <span />
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--dash-border)] bg-[var(--dash-surface-2)] shrink-0">
          <h2 className="text-base font-bold text-[var(--dash-text)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="admin-icon-btn w-8 h-8 rounded-full"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="px-5 py-4 border-t border-[var(--dash-border)] bg-[var(--dash-surface-2)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
