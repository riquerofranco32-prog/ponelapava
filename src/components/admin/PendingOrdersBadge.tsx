"use client";

import { useEffect, useState } from "react";
import { Order } from "@/types";

const POLL_INTERVAL_MS = 30_000;

export default function PendingOrdersBadge({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/orders");
        if (!res.ok) return;
        const orders: Order[] = await res.json();
        if (!cancelled) {
          setCount(orders.filter((o) => o.status === "pending").length);
        }
      } catch {
        // silent — a failed poll just keeps the last known count
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: collapsed ? 16 : 18,
        height: collapsed ? 16 : 18,
        padding: collapsed ? 0 : "0 5px",
        borderRadius: 999,
        background: "var(--dash-danger)",
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
        lineHeight: 1,
        ...(collapsed ? { position: "absolute", top: 2, right: 8 } : undefined),
      }}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
