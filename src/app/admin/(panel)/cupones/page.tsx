"use client";

import { useEffect, useState } from "react";
import CouponsPanel from "@/components/admin/CouponsPanel";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { KpiSkeleton, TableSkeleton } from "@/components/admin/TableSkeleton";
import { Coupon } from "@/types";
import { assertOk } from "@/lib/admin-fetch";

export default function AdminCuponesPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCoupons() {
    try {
      const res = await fetch("/api/admin/coupons");
      assertOk(res, "No se pudieron cargar los cupones");
      const data = await res.json();
      setCoupons(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar cupones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <KpiSkeleton count={3} />
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div>
      {error && <AdminErrorBanner message={error} />}
      <CouponsPanel coupons={coupons} onChange={loadCoupons} />
    </div>
  );
}
