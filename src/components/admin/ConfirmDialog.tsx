"use client";

import { useState } from "react";
import { AdminModal } from "./AdminModal";
import { AdminButton } from "./AdminButton";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Eliminar",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
      setPending(false);
    }
  }

  return (
    <AdminModal
      title={title}
      onClose={onCancel}
      maxWidth={400}
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <AdminButton
            variant="secondary"
            onClick={onCancel}
            disabled={pending}
          >
            Cancelar
          </AdminButton>
          <AdminButton
            variant="danger"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? "Eliminando..." : confirmLabel}
          </AdminButton>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-[var(--dash-text)]">
        {message}
      </p>
      {error && (
        <p className="mt-3 text-xs text-[var(--dash-danger)] font-medium">
          {error}
        </p>
      )}
    </AdminModal>
  );
}
