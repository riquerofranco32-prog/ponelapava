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
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
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
      <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--dash-text)" }}>
        {message}
      </p>
      {error && (
        <p
          style={{
            marginTop: 12,
            fontSize: 13,
            color: "var(--dash-danger)",
          }}
        >
          {error}
        </p>
      )}
    </AdminModal>
  );
}
