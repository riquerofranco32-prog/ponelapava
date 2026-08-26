"use client";

import { useState, useEffect } from "react";
import { Target, TrendingUp, Calendar, Edit3, Check, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useAdminToast } from "@/components/admin/AdminToast";

interface SalesGoalWidgetProps {
  currentRevenue: number;
}

const DEFAULT_GOAL = 1500000; // $1.5M ARS

export function SalesGoalWidget({ currentRevenue }: SalesGoalWidgetProps) {
  const [goal, setGoal] = useState<number>(DEFAULT_GOAL);
  const [isEditing, setIsEditing] = useState(false);
  const [goalInput, setGoalInput] = useState<string>(String(DEFAULT_GOAL));
  const showToast = useAdminToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pava_monthly_sales_goal");
      if (saved) {
        const val = Number(saved);
        if (!isNaN(val) && val > 0) {
          setGoal(val);
          setGoalInput(String(val));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  function handleSaveGoal(e: React.FormEvent) {
    e.preventDefault();
    const val = Number(goalInput);
    if (isNaN(val) || val <= 0) {
      showToast("Ingresá un valor numérico válido para la meta", "error");
      return;
    }
    setGoal(val);
    try {
      localStorage.setItem("pava_monthly_sales_goal", String(val));
    } catch {
      // ignore
    }
    setIsEditing(false);
    showToast(`Meta mensual actualizada a ${formatPrice(val)}`);
  }

  // Calculate days in month and remaining
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const remainingDays = Math.max(1, daysInMonth - currentDay);
  const monthName = now.toLocaleString("es-AR", { month: "long" });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const percent = Math.min(100, Math.round((currentRevenue / goal) * 100));
  const remainingAmount = Math.max(0, goal - currentRevenue);
  const dailyPaceNeeded = Math.round(remainingAmount / remainingDays);
  const isGoalReached = currentRevenue >= goal;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, var(--dash-surface) 0%, var(--dash-surface-2) 100%)",
        border: "1px solid var(--dash-border)",
        borderRadius: 14,
        padding: "16px 20px",
        marginBottom: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Accent Glow */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: isGoalReached ? "rgba(16, 185, 129, 0.08)" : "rgba(199, 166, 122, 0.08)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      {/* Header: Title + Goal badge + Edit button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: isGoalReached ? "rgba(16, 185, 129, 0.15)" : "var(--dash-accent-subtle)",
              color: isGoalReached ? "#10b981" : "var(--dash-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isGoalReached ? <Sparkles size={16} /> : <Target size={16} />}
          </div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text)", display: "block" }}>
              Objetivo de Ventas · {capitalizedMonth}
            </span>
            <span style={{ fontSize: 11, color: "var(--dash-muted)" }}>
              Quedan {remainingDays} día{remainingDays === 1 ? "" : "s"} para el cierre de mes
            </span>
          </div>
        </div>

        {/* Right side: Goal progress pill or Edit Form */}
        <div>
          {isEditing ? (
            <form onSubmit={handleSaveGoal} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="number"
                step={50000}
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="admin-input"
                style={{ width: 130, padding: "4px 8px", fontSize: 12 }}
                autoFocus
              />
              <button
                type="submit"
                className="admin-btn admin-btn--primary"
                style={{ padding: "4px 8px", fontSize: 12 }}
                title="Guardar objetivo"
              >
                <Check size={13} />
              </button>
            </form>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isGoalReached ? "#10b981" : "var(--dash-accent)",
                  background: isGoalReached ? "rgba(16, 185, 129, 0.12)" : "var(--dash-accent-subtle)",
                  padding: "3px 10px",
                  borderRadius: 20,
                  border: isGoalReached ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(199, 166, 122, 0.3)",
                }}
              >
                {isGoalReached ? "🎉 ¡Meta Cumplida!" : `${percent}% Alcanzado`}
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                title="Modificar meta mensual"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--dash-muted)",
                  cursor: "pointer",
                  padding: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <Edit3 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Numbers Breakdown */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        <div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--dash-text)" }}>
            {formatPrice(currentRevenue)}
          </span>
          <span style={{ fontSize: 13, color: "var(--dash-muted)", marginLeft: 6 }}>
            de {formatPrice(goal)}
          </span>
        </div>

        {!isGoalReached && remainingAmount > 0 && (
          <div style={{ fontSize: 12, color: "var(--dash-muted)", display: "flex", alignItems: "center", gap: 4 }}>
            <TrendingUp size={13} style={{ color: "var(--dash-accent)" }} />
            <span>
              Ritmo necesario: <strong style={{ color: "var(--dash-text)" }}>{formatPrice(dailyPaceNeeded)}/día</strong>
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: "100%",
          height: 8,
          background: "var(--dash-surface-3)",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: isGoalReached
              ? "linear-gradient(90deg, #10b981 0%, #34d399 100%)"
              : "linear-gradient(90deg, var(--dash-accent) 0%, #e2cead 100%)",
            borderRadius: 6,
            transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );
}
