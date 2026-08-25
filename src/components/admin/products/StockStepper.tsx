"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { LOW_STOCK_THRESHOLD } from "@/lib/utils";

const DEBOUNCE_MS = 400;

export function stockColor(value: number): string {
  if (value <= 0) return "var(--dash-danger)";
  if (value <= LOW_STOCK_THRESHOLD) return "var(--dash-accent)";
  return "var(--dash-text)";
}

// Clicks update the count instantly (optimistic) but the network write is
// debounced and collapsed into one PUT per pause — five quick clicks used
// to fire five PUTs in a race, where whichever response landed last won,
// not whichever was clicked last.
export function StockStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => Promise<void>;
}) {
  const [localValue, setLocalValue] = useState(value);
  const [confirmedTick, setConfirmedTick] = useState(0);
  const pendingRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Re-sync from the parent's confirmed value only while nothing is in
  // flight, or once it catches up to what was last committed — otherwise
  // a slower parent refetch would snap the optimistic count back mid-click.
  useEffect(() => {
    if (pendingRef.current === null || value === pendingRef.current) {
      setLocalValue(value);
      pendingRef.current = null;
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function step(delta: number) {
    const next = Math.max(0, localValue + delta);
    setLocalValue(next);
    pendingRef.current = next;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await onChangeRef.current(next);
        setConfirmedTick((tick) => tick + 1);
      } catch {
        // The caller already surfaced the error (toast) — just roll the
        // optimistic count back to the last confirmed value.
        pendingRef.current = null;
        setLocalValue(value);
      }
    }, DEBOUNCE_MS);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <StepButton
        label="Restar una unidad"
        disabled={localValue <= 0}
        onClick={() => step(-1)}
      >
        <Minus size={12} />
      </StepButton>
      <span
        key={confirmedTick}
        className="admin-stock-pulse"
        style={{
          minWidth: 22,
          textAlign: "center",
          fontSize: 13,
          fontWeight: 600,
          color: stockColor(localValue),
        }}
      >
        {localValue}
      </span>
      <StepButton label="Sumar una unidad" onClick={() => step(1)}>
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
      className="admin-icon-btn"
      style={{ width: 22, height: 22, opacity: disabled ? 0.5 : 1 }}
    >
      {children}
    </button>
  );
}
