"use client";

import { Minus, Plus } from "lucide-react";
import { LOW_STOCK_THRESHOLD } from "@/lib/utils";

export function stockColor(value: number): string {
  if (value <= 0) return "var(--dash-danger)";
  if (value <= LOW_STOCK_THRESHOLD) return "var(--dash-accent)";
  return "var(--dash-text)";
}

export function StockStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <StepButton
        label="Restar una unidad"
        disabled={value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        <Minus size={12} />
      </StepButton>
      <span
        style={{
          minWidth: 22,
          textAlign: "center",
          fontSize: 13,
          fontWeight: 600,
          color: stockColor(value),
        }}
      >
        {value}
      </span>
      <StepButton label="Sumar una unidad" onClick={() => onChange(value + 1)}>
        <Plus size={12} />
      </StepButton>
    </div>
  );
}

function StepButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--dash-surface-2)",
        border: "1px solid var(--dash-border)",
        color: "var(--dash-muted)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}
