"use client";

import { Package, Star, AlertTriangle, PackageX } from "lucide-react";
import { AdminKpiCard } from "@/components/admin/AdminCard";
import { KpiSkeleton } from "@/components/admin/TableSkeleton";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import DashboardStats from "@/components/admin/DashboardStats";
import { useAdminProducts } from "@/lib/useAdminProducts";

export default function AdminDashboardPage() {
  const { products, loading, loadError, handleStockChange } =
    useAdminProducts();

  return (
    <div>
      {loadError && <AdminErrorBanner message={loadError} />}

      <DashboardStats products={products} onStockChange={handleStockChange} />

      {loading ? (
        <KpiSkeleton count={4} />
      ) : (
        <div className="admin-kpi-grid">
          <AdminKpiCard
            icon={Package}
            label="Total de productos"
            value={products.length}
          />
          <AdminKpiCard
            icon={Star}
            label="Destacados"
            value={products.filter((p) => p.featured).length}
          />
          <AdminKpiCard
            icon={PackageX}
            label="Agotados"
            value={products.filter((p) => p.status === "out_of_stock").length}
          />
          <AdminKpiCard
            icon={AlertTriangle}
            label="Stock bajo (≤5)"
            value={products.filter((p) => p.stock > 0 && p.stock <= 5).length}
          />
        </div>
      )}
    </div>
  );
}
