"use client";

import { useRouter } from "next/navigation";
import { Package, Star, AlertTriangle, PackageX } from "lucide-react";
import { AdminKpiCard } from "@/components/admin/AdminCard";
import { KpiSkeleton } from "@/components/admin/TableSkeleton";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import DashboardStats from "@/components/admin/DashboardStats";
import { OwnerExecutiveHeader } from "@/components/admin/dashboard/OwnerExecutiveHeader";
import { useAdminProducts } from "@/lib/useAdminProducts";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { products, loading, loadError, handleStockChange } = useAdminProducts();

  return (
    <div className="admin-page-reveal space-y-6">
      {loadError && <AdminErrorBanner message={loadError} />}

      {/* Top Executive Header & Launchpad for Owners */}
      <OwnerExecutiveHeader
        products={products}
        onNewProductClick={() => router.push("/admin/productos?action=new")}
      />

      {/* Operational Stats & Sales Goal */}
      <DashboardStats products={products} onStockChange={handleStockChange} />

      {/* Inventory Health & Quick Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">
            📦 Inventario & Estado del Catálogo
          </span>
          <span className="text-xs text-[var(--dash-muted)]">
            Tocá cualquier tarjeta para abrir filtrado
          </span>
        </div>

        {loading ? (
          <KpiSkeleton count={4} />
        ) : (
          <div className="admin-kpi-grid">
            <AdminKpiCard
              icon={Package}
              label="Total de productos"
              value={products.length}
              onClick={() => router.push("/admin/productos")}
            />
            <AdminKpiCard
              icon={Star}
              label="Destacados en tienda"
              value={products.filter((p) => p.featured).length}
              onClick={() => router.push("/admin/productos?featured=true")}
            />
            <AdminKpiCard
              icon={PackageX}
              label="Agotados (Sin stock)"
              value={products.filter((p) => p.status === "out_of_stock" || p.stock === 0).length}
              onClick={() => router.push("/admin/productos?stock=out")}
            />
            <AdminKpiCard
              icon={AlertTriangle}
              label="Stock crítico (≤5)"
              value={products.filter((p) => p.stock > 0 && p.stock <= 5).length}
              onClick={() => router.push("/admin/productos?stock=low")}
            />
          </div>
        )}
      </div>
    </div>
  );
}

