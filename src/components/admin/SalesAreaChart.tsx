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
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
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
            interval={
              chartData.length > 30 ? Math.ceil(chartData.length / 15) : 0
            }
          />
          <YAxis
            stroke="#9c9280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v) => (v === 0 ? "0" : `${Math.round(v / 1000)}k`)}
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
  );
}
