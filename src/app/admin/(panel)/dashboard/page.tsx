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

      {/* Quick Launchpad Shortcuts */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 24,
          padding: "12px 16px",
          borderRadius: 12,
          background: "var(--dash-surface)",
          border: "1px solid var(--dash-border)",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--dash-muted)" }}>
          ⚡ Accesos Rápidos
        </span>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a
            href="/admin/productos?action=new"
            className="admin-btn admin-btn--primary"
            style={{ fontSize: 12, padding: "6px 12px", textDecoration: "none" }}
          >
            + Nuevo Producto
          </a>
          <a
            href="/admin/marketing"
            className="admin-btn admin-btn--secondary"
            style={{ fontSize: 12, padding: "6px 12px", textDecoration: "none" }}
          >
            ✨ Landing & Fotos
          </a>
          <a
            href="/admin/cupones"
            className="admin-btn admin-btn--secondary"
            style={{ fontSize: 12, padding: "6px 12px", textDecoration: "none" }}
          >
            🏷️ Cupones
          </a>
          <a
            href="/admin/reportes"
            className="admin-btn admin-btn--secondary"
            style={{ fontSize: 12, padding: "6px 12px", textDecoration: "none" }}
          >
            📊 Reportes
          </a>
        </div>
      </div>

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
