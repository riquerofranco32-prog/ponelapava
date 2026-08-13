"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DollarSign, ShoppingCart, Receipt } from "lucide-react";
import { DashboardStats as Stats } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import { AdminCard, AdminKpiCard } from "./AdminCard";
import { assertOk } from "@/lib/admin-fetch";

function formatDayLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        assertOk(res, "No se pudieron cargar las métricas");
        return res.json();
      })
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div
        style={{
          background: "var(--dash-danger-bg)",
          border: "1px solid var(--dash-danger-border)",
          borderRadius: 8,
          padding: "12px 16px",
          fontSize: 14,
          color: "var(--dash-danger)",
          marginBottom: 24,
        }}
      >
        {error}
      </div>
    );
  }

  const chartData =
    stats?.salesByDay.map((d) => ({ ...d, label: formatDayLabel(d.date) })) ??
    [];

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <AdminKpiCard
          icon={DollarSign}
          label="Ingresos (14 días)"
          value={stats ? formatPrice(stats.totalRevenue) : "…"}
        />
        <AdminKpiCard
          icon={ShoppingCart}
          label="Pedidos (14 días)"
          value={stats?.orderCount ?? "…"}
        />
        <AdminKpiCard
          icon={Receipt}
          label="Ticket promedio"
          value={stats ? formatPrice(stats.avgTicket) : "…"}
        />
      </div>

      <AdminCard style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 16,
            color: "var(--dash-text)",
          }}
        >
          Ventas últimos 14 días
        </h2>
        {stats && stats.orderCount === 0 ? (
          <p style={{ fontSize: 13, color: "var(--dash-muted)" }}>
            Todavía no hay pedidos registrados en este período.
          </p>
        ) : (
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#c7a67a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#c7a67a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#3a3324"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="#9c9280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9c9280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={(v) =>
                    v === 0 ? "0" : `${Math.round(v / 1000)}k`
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "#1e1b15",
                    border: "1px solid #3a3324",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#f3ede0" }}
                  formatter={(value) => [formatPrice(Number(value)), "Ventas"]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#c7a67a"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </AdminCard>

      {stats && stats.topProducts.length > 0 && (
        <AdminCard>
          <h2
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 16,
              color: "var(--dash-text)",
            }}
          >
            Más vendidos (14 días)
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stats.topProducts.map((p, i) => (
              <div
                key={p.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--dash-text)" }}>
                  <span style={{ color: "var(--dash-muted)", marginRight: 8 }}>
                    {i + 1}.
                  </span>
                  {p.name}
                </span>
                <span style={{ color: "var(--dash-muted)" }}>
                  {p.quantity} vendidos
                </span>
              </div>
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
}
