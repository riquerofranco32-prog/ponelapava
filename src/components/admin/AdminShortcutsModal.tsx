"use client";

import { X, Command, Keyboard } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminButton } from "@/components/admin/AdminButton";

interface AdminShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Navegación y Búsqueda",
    shortcuts: [
      {
        keys: ["⌘", "K"],
        description: "Abrir Command Palette / Búsqueda global",
      },
      {
        keys: ["/"],
        description: "Foco directo en el buscador de productos",
      },
      {
        keys: ["?"],
        description: "Abrir este panel de atajos de teclado",
      },
      {
        keys: ["Esc"],
        description: "Cerrar modal o cancelar búsqueda",
      },
    ],
  },
  {
    title: "Tablas y Listas",
    shortcuts: [
      {
        keys: ["↑", "↓"],
        description: "Navegar entre resultados en Command Palette",
      },
      {
        keys: ["↵"],
        description: "Seleccionar ítem / confirmar acción",
      },
    ],
  },
];

export default function AdminShortcutsModal({
  isOpen,
  onClose,
}: AdminShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <AdminModal
      title="Atajos de Teclado"
      onClose={onClose}
      maxWidth={480}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <AdminButton variant="secondary" onClick={onClose}>
            Entendido
          </AdminButton>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {SHORTCUT_GROUPS.map((group) => (
          <div key={group.title}>
            <h4
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--dash-accent)",
                marginBottom: 10,
              }}
            >
              {group.title}
            </h4>
            <div
              style={{
                background: "var(--dash-surface-2)",
                borderRadius: "var(--radius-control)",
                border: "1px solid var(--dash-border)",
                overflow: "hidden",
              }}
            >
              {group.shortcuts.map((s, idx) => (
                <div
                  key={s.description}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderBottom:
                      idx < group.shortcuts.length - 1
                        ? "1px solid var(--dash-border)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--dash-text)",
                    }}
                  >
                    {s.description}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 24,
                          height: 24,
                          padding: "0 6px",
                          fontSize: 12,
                          fontWeight: 700,
                          borderRadius: 4,
                          background: "var(--dash-surface)",
                          border: "1px solid var(--dash-border)",
                          color: "var(--dash-accent)",
                          boxShadow: "0 2px 0 var(--dash-border)",
                          fontFamily: "monospace",
                        }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminModal>
  );
}
