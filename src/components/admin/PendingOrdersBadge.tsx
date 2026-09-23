"use client";

import { useEffect, useState } from "react";

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
        const res = await fetch("/api/admin/orders/pending-count");
        if (!res.ok) return;
        const { count } = await res.json();
        if (!cancelled) setCount(count);
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
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--dash-danger)] text-white text-xs font-bold leading-none shrink-0 ${
        collapsed ? "absolute top-1.5 right-2" : ""
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
