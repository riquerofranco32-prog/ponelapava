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
    <div className="bg-gradient-to-br from-[var(--dash-surface)] to-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-2xl p-4 md:p-5 mb-6 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div
        className={`absolute -top-5 -right-5 w-36 h-36 rounded-full blur-2xl pointer-events-none ${
          isGoalReached ? "bg-[var(--dash-success)]/10" : "bg-[var(--dash-accent)]/10"
        }`}
      />

      {/* Header: Title + Goal badge + Edit button */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isGoalReached
                ? "bg-[var(--dash-success-bg)] text-[var(--dash-success)] border border-[var(--dash-success-border)]"
                : "bg-[var(--dash-accent-subtle)] text-[var(--dash-accent)] border border-[var(--dash-border)]"
            }`}
          >
            {isGoalReached ? <Sparkles size={16} /> : <Target size={16} />}
          </div>
          <div>
            <span className="text-sm font-bold text-[var(--dash-text)] block">
              Objetivo de Ventas · {capitalizedMonth}
            </span>
            <span className="text-xs text-[var(--dash-muted)]">
              Quedan {remainingDays} día{remainingDays === 1 ? "" : "s"} para el cierre de mes
            </span>
          </div>
        </div>

        {/* Right side: Goal progress pill or Edit Form */}
        <div>
          {isEditing ? (
            <form onSubmit={handleSaveGoal} className="flex items-center gap-1.5">
              <input
                type="number"
                step={50000}
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="admin-input w-32 px-2 py-1 text-xs"
                autoFocus
              />
              <button
                type="submit"
                className="admin-btn admin-btn--primary px-2 py-1 text-xs"
                title="Guardar objetivo"
              >
                <Check size={13} />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                  isGoalReached
                    ? "text-[var(--dash-success)] bg-[var(--dash-success-bg)] border-[var(--dash-success-border)]"
                    : "text-[var(--dash-accent)] bg-[var(--dash-accent-subtle)] border-[var(--dash-border)]"
                }`}
              >
                {isGoalReached ? (
                  <>
                    <Sparkles size={12} />
                    <span>¡Meta Cumplida!</span>
                  </>
                ) : (
                  `${percent}% Alcanzado`
                )}
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                title="Modificar meta mensual"
                className="bg-transparent border-none text-[var(--dash-muted)] hover:text-[var(--dash-text)] cursor-pointer p-1 inline-flex items-center"
              >
                <Edit3 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Numbers Breakdown */}
      <div className="flex justify-between items-baseline mb-2 flex-wrap gap-1.5">
        <div>
          <span className="text-xl font-extrabold text-[var(--dash-text)]">
            {formatPrice(currentRevenue)}
          </span>
          <span className="text-xs text-[var(--dash-muted)] ml-1.5">
            de {formatPrice(goal)}
          </span>
        </div>

        {!isGoalReached && remainingAmount > 0 && (
          <div className="text-xs text-[var(--dash-muted)] flex items-center gap-1">
            <TrendingUp size={13} className="text-[var(--dash-accent)]" />
            <span>
              Ritmo necesario: <strong className="text-[var(--dash-text)]">{formatPrice(dailyPaceNeeded)}/día</strong>
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[var(--dash-surface-3)] rounded-full overflow-hidden">
        <div
          style={{ width: `${percent}%` }}
          className={`h-full rounded-full transition-all duration-700 ${
            isGoalReached
              ? "bg-[var(--dash-success)]"
              : "bg-[var(--dash-accent)]"
          }`}
        />
      </div>
    </div>
  );
}
