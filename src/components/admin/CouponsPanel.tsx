"use client";

import { useState } from "react";
import {
  TicketPercent,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  Percent,
  Search,
} from "lucide-react";
import { Coupon, CouponInput } from "@/types";
import { formatPrice } from "@/lib/utils";
import { assertOk } from "@/lib/admin-fetch";
import { AdminCard, AdminKpiCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { IconButton } from "@/components/admin/products/IconButton";
import { useAdminToast } from "@/components/admin/AdminToast";
import CouponFormModal from "@/components/admin/CouponFormModal";

interface CouponsPanelProps {
  coupons: Coupon[];
  onChange: () => void;
}

export default function CouponsPanel({ coupons, onChange }: CouponsPanelProps) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [search, setSearch] = useState("");
  const showToast = useAdminToast();

  const now = new Date();

  function isExpired(c: Coupon) {
    if (!c.validUntil) return false;
    return new Date(c.validUntil) < now;
  }

  const activeCount = coupons.filter((c) => c.active && !isExpired(c)).length;
  const percentCount = coupons.filter((c) => c.discountType === "percent").length;
  const fixedCount = coupons.filter((c) => c.discountType === "fixed").length;

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.trim().toLowerCase()),
  );

  async function handleCreate(input: CouponInput) {
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    assertOk(res, "No se pudo crear el cupón");
    setCreating(false);
    onChange();
    showToast("Cupón creado exitosamente");
  }

  async function handleUpdate(id: string, input: CouponInput) {
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    assertOk(res, "No se pudo actualizar el cupón");
    setEditing(null);
    onChange();
    showToast("Cupón actualizado");
  }

  async function handleToggleActive(coupon: Coupon) {
    const { id, createdAt: _created, ...rest } = coupon;
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rest, active: !coupon.active }),
    });
    assertOk(res, "No se pudo actualizar el estado del cupón");
    onChange();
    showToast(coupon.active ? "Cupón pausado" : "Cupón activado");
  }

  async function handleDelete(coupon: Coupon) {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "DELETE",
    });
    assertOk(res, "No se pudo eliminar el cupón");
    setDeleting(null);
    onChange();
    showToast("Cupón eliminado");
  }

  return (
    <div>
      {/* KPI Cards */}
      <div className="admin-kpi-grid" style={{ marginBottom: 24 }}>
        <AdminKpiCard
          icon={TicketPercent}
          label="Total de Cupones"
          value={coupons.length}
        />
        <AdminKpiCard
          icon={CheckCircle2}
          label="Cupones Activos"
          value={activeCount}
        />
        <AdminKpiCard
          icon={Percent}
          label="Porcentuales / Fijos"
          value={`${percentCount} / ${fixedCount}`}
        />
      </div>

      {/* Main Table Card */}
      <AdminCard>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TicketPercent size={18} style={{ color: "var(--dash-accent)" }} />
            <span style={{ fontWeight: 600, fontSize: 16, color: "var(--dash-text)" }}>
              Cupones de Descuento
            </span>
            <span
              style={{
                fontSize: 12,
                color: "var(--dash-text-muted)",
                background: "var(--dash-surface-elevated)",
                padding: "2px 8px",
                borderRadius: "var(--radius-chip)",
                border: "1px solid var(--dash-border)",
              }}
            >
              {coupons.length}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--dash-text-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Buscar código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-input"
                style={{
                  paddingLeft: 30,
                  paddingTop: 6,
                  paddingBottom: 6,
                  fontSize: 13,
                  width: 180,
                }}
              />
            </div>

            <AdminButton
              variant="primary"
              onClick={() => setCreating(true)}
            >
              <Plus size={15} style={{ marginRight: 6, display: "inline" }} />
              Nuevo Cupón
            </AdminButton>
          </div>
        </div>

        {filteredCoupons.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "20px 0" }}>
            <EmptyState
              icon={TicketPercent}
              title={
                coupons.length === 0
                  ? "No hay cupones creados"
                  : "No se encontraron cupones"
              }
              description={
                coupons.length === 0
                  ? "Creá tu primer cupón para ofrecer descuentos por porcentaje o monto fijo en ventas."
                  : `No hay coincidencias para "${search}".`
              }
            />
            {coupons.length === 0 && (
              <AdminButton
                variant="primary"
                onClick={() => setCreating(true)}
              >
                <Plus size={15} style={{ marginRight: 6, display: "inline" }} />
                Crear Cupón
              </AdminButton>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descuento</th>
                  <th>Período de Validez</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => {
                  const expired = isExpired(coupon);
                  return (
                    <tr key={coupon.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              fontSize: 14,
                              background: "var(--dash-surface-elevated)",
                              color: "var(--dash-text)",
                              padding: "4px 8px",
                              borderRadius: "var(--radius-chip)",
                              border: "1px solid var(--dash-border)",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {coupon.code}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--dash-accent)",
                            fontSize: 14,
                          }}
                        >
                          {coupon.discountType === "percent"
                            ? `${coupon.discountValue}% OFF`
                            : `${formatPrice(coupon.discountValue)} OFF`}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--dash-text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Calendar size={13} />
                          {coupon.validFrom || coupon.validUntil ? (
                            <span>
                              {coupon.validFrom
                                ? new Date(coupon.validFrom).toLocaleDateString("es-AR")
                                : "Inicio"}{" "}
                              al{" "}
                              {coupon.validUntil
                                ? new Date(coupon.validUntil).toLocaleDateString("es-AR")
                                : "Sin límite"}
                            </span>
                          ) : (
                            <span>Siempre válido</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {expired ? (
                          <span
                            className="admin-badge"
                            style={{
                              background: "rgba(220, 38, 38, 0.12)",
                              color: "var(--dash-danger)",
                              border: "1px solid rgba(220, 38, 38, 0.25)",
                            }}
                          >
                            <XCircle size={12} style={{ marginRight: 4 }} />
                            Expirado
                          </span>
                        ) : coupon.active ? (
                          <span
                            className="admin-badge"
                            style={{
                              background: "rgba(34, 197, 94, 0.12)",
                              color: "var(--dash-success, #16a34a)",
                              border: "1px solid rgba(34, 197, 94, 0.25)",
                            }}
                          >
                            <CheckCircle2 size={12} style={{ marginRight: 4 }} />
                            Activo
                          </span>
                        ) : (
                          <span
                            className="admin-badge"
                            style={{
                              background: "var(--dash-surface-elevated)",
                              color: "var(--dash-text-muted)",
                              border: "1px solid var(--dash-border)",
                            }}
                          >
                            Pausado
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            gap: 6,
                            alignItems: "center",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleActive(coupon)}
                            className="admin-btn admin-btn--secondary"
                            style={{ fontSize: 12, padding: "4px 8px" }}
                          >
                            {coupon.active ? "Pausar" : "Activar"}
                          </button>
                          <IconButton
                            icon={Pencil}
                            title="Editar cupón"
                            onClick={() => setEditing(coupon)}
                          />
                          <IconButton
                            icon={Trash2}
                            title="Eliminar cupón"
                            danger
                            onClick={() => setDeleting(coupon)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Modal Crear */}
      {creating && (
        <CouponFormModal
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {/* Modal Editar */}
      {editing && (
        <CouponFormModal
          coupon={editing}
          onSave={(input) => handleUpdate(editing.id, input)}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* Confirmar Eliminación */}
      {deleting && (
        <ConfirmDialog
          title="¿Eliminar cupón?"
          message={`¿Estás seguro de que querés eliminar el cupón "${deleting.code}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar cupón"
          onConfirm={() => handleDelete(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
