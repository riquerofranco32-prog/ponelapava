"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatPrice } from "@/lib/utils";

function formatDayLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

export function SalesAreaChart({
  data,
}: {
  data: { date: string; total: number }[];
}) {
  const chartData = data.map((d) => ({ ...d, label: formatDayLabel(d.date) }));

  return (
    <div className="w-full h-[220px]">
      <ResponsiveContainer>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--dash-accent)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--dash-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--dash-border)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            stroke="var(--dash-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval={
              chartData.length > 7 ? Math.ceil(chartData.length / 6) : 0
            }
          />
          <YAxis
            stroke="var(--dash-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v) => (v === 0 ? "0" : `${Math.round(v / 1000)}k`)}
          />
          <Tooltip
            contentStyle={{
              background: "var(--dash-surface-2)",
              border: "1px solid var(--dash-border)",
              borderRadius: "var(--dash-radius-md)",
              fontSize: 12,
              color: "var(--dash-text)",
            }}
            labelStyle={{ color: "var(--dash-text)" }}
            formatter={(value) => [formatPrice(Number(value)), "Ventas"]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--dash-accent)"
            strokeWidth={2}
            fill="url(#salesGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
