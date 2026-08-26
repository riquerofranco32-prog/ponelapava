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
  Copy,
  Check,
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
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "paused">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const showToast = useAdminToast();

  const now = new Date();

  function isExpired(c: Coupon) {
    if (!c.validUntil) return false;
    return new Date(c.validUntil) < now;
  }

  const activeCount = coupons.filter((c) => c.active && !isExpired(c)).length;
  const expiredCount = coupons.filter(isExpired).length;
  const pausedCount = coupons.filter((c) => !c.active && !isExpired(c)).length;
  const percentCount = coupons.filter((c) => c.discountType === "percent").length;
  const fixedCount = coupons.filter((c) => c.discountType === "fixed").length;

  const filteredCoupons = coupons.filter((c) => {
    if (search.trim() && !c.code.toLowerCase().includes(search.trim().toLowerCase())) {
      return false;
    }
    if (statusFilter === "active") return c.active && !isExpired(c);
    if (statusFilter === "expired") return isExpired(c);
    if (statusFilter === "paused") return !c.active && !isExpired(c);
    return true;
  });

  async function handleCopy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showToast(`Código ${code} copiado al portapapeles`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      showToast("Error al copiar código", "error");
    }
  }

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

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {(
            [
              { key: "all", label: "Todos", count: coupons.length },
              { key: "active", label: "Activos", count: activeCount },
              { key: "paused", label: "Pausados", count: pausedCount },
              { key: "expired", label: "Expirados", count: expiredCount },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`admin-toolbar-pill${statusFilter === tab.key ? " admin-toolbar-pill--active" : ""}`}
              style={{ fontSize: 11, padding: "3px 9px" }}
            >
              <span>{tab.label}</span>
              <span style={{ marginLeft: 4, opacity: 0.75, fontWeight: statusFilter === tab.key ? 700 : 500 }}>
                ({tab.count})
              </span>
            </button>
          ))}
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
          <>
            {/* Desktop Table View */}
            <div className="admin-desktop-only" style={{ overflowX: "auto" }}>
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
                    const isCopied = copiedCode === coupon.code;
                    return (
                      <tr key={coupon.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontWeight: 700,
                                fontSize: 13,
                                background: "var(--dash-surface-elevated)",
                                color: "var(--dash-text)",
                                padding: "3px 8px",
                                borderRadius: "var(--radius-chip)",
                                border: "1px solid var(--dash-border)",
                                letterSpacing: "0.06em",
                              }}
                            >
                              {coupon.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(coupon.code)}
                              title="Copiar código del cupón"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 4,
                                color: isCopied ? "var(--dash-success, #16a34a)" : "var(--dash-text-muted)",
                                display: "inline-flex",
                                alignItems: "center",
                                borderRadius: 4,
                              }}
                            >
                              {isCopied ? <Check size={13} /> : <Copy size={13} />}
                            </button>
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

            {/* Mobile Card List View */}
            <div className="admin-mobile-only" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredCoupons.map((coupon, index) => {
                const expired = isExpired(coupon);
                const isCopied = copiedCode === coupon.code;
                return (
                  <div
                    key={coupon.id}
                    className="admin-row-in"
                    style={
                      {
                        padding: 14,
                        background: "var(--dash-surface)",
                        border: "1px solid var(--dash-border)",
                        borderRadius: 10,
                        "--i": index,
                      } as React.CSSProperties
                    }
                  >
                    {/* Header: Code + Copy + Status */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            fontSize: 14,
                            background: "var(--dash-surface-elevated)",
                            color: "var(--dash-text)",
                            padding: "3px 8px",
                            borderRadius: "var(--radius-chip)",
                            border: "1px solid var(--dash-border)",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {coupon.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(coupon.code)}
                          title="Copiar código del cupón"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 6,
                            color: isCopied ? "var(--dash-success, #16a34a)" : "var(--dash-text-muted)",
                            display: "inline-flex",
                            alignItems: "center",
                            borderRadius: 4,
                          }}
                        >
                          {isCopied ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>

                      {expired ? (
                        <span
                          className="admin-badge"
                          style={{
                            background: "rgba(220, 38, 38, 0.12)",
                            color: "var(--dash-danger)",
                            border: "1px solid rgba(220, 38, 38, 0.25)",
                            fontSize: 11,
                          }}
                        >
                          <XCircle size={11} style={{ marginRight: 3 }} />
                          Expirado
                        </span>
                      ) : coupon.active ? (
                        <span
                          className="admin-badge"
                          style={{
                            background: "rgba(34, 197, 94, 0.12)",
                            color: "var(--dash-success, #16a34a)",
                            border: "1px solid rgba(34, 197, 94, 0.25)",
                            fontSize: 11,
                          }}
                        >
                          <CheckCircle2 size={11} style={{ marginRight: 3 }} />
                          Activo
                        </span>
                      ) : (
                        <span
                          className="admin-badge"
                          style={{
                            background: "var(--dash-surface-elevated)",
                            color: "var(--dash-text-muted)",
                            border: "1px solid var(--dash-border)",
                            fontSize: 11,
                          }}
                        >
                          Pausado
                        </span>
                      )}
                    </div>

                    {/* Discount & Validity */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, margin: "10px 0" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: "var(--dash-accent)",
                          fontSize: 16,
                        }}
                      >
                        {coupon.discountType === "percent"
                          ? `${coupon.discountValue}% OFF`
                          : `${formatPrice(coupon.discountValue)} OFF`}
                      </span>

                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--dash-text-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Calendar size={12} />
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
                    </div>

                    {/* Actions Bar */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: "1px solid var(--dash-border)",
                        paddingTop: 10,
                        marginTop: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleActive(coupon)}
                        className="admin-btn admin-btn--secondary"
                        style={{ fontSize: 12, padding: "6px 12px" }}
                      >
                        {coupon.active ? "Pausar Cupón" : "Activar Cupón"}
                      </button>

                      <div style={{ display: "flex", gap: 6 }}>
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
                    </div>
                  </div>
                );
              })}
            </div>
          </>
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
