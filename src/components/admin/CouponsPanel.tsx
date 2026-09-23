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
      <div className="admin-kpi-grid mb-6">
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
        <div className="flex items-center justify-between w-full flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <TicketPercent size={18} className="text-[var(--dash-accent)]" />
            <span className="font-semibold text-base text-[var(--dash-text)]">
              Cupones de Descuento
            </span>
            <span className="text-xs text-[var(--dash-muted)] bg-[var(--dash-surface-elevated)] px-2 py-0.5 rounded-full border border-[var(--dash-border)]">
              {coupons.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--dash-muted)]"
              />
              <input
                type="text"
                placeholder="Buscar código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-input pl-8 py-1.5 text-xs w-44"
              />
            </div>

            <AdminButton
              variant="primary"
              onClick={() => setCreating(true)}
            >
              <Plus size={15} className="mr-1.5 inline" />
              Nuevo Cupón
            </AdminButton>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 flex-wrap mb-4">
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
              className={`admin-toolbar-pill text-xs px-2.5 py-1 ${statusFilter === tab.key ? " admin-toolbar-pill--active" : ""}`}
            >
              <span>{tab.label}</span>
              <span className={`ml-1 ${statusFilter === tab.key ? "font-bold" : "opacity-75"}`}>
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {filteredCoupons.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-5">
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
                <Plus size={15} className="mr-1.5 inline" />
                Crear Cupón
              </AdminButton>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="admin-desktop-only overflow-x-auto">
              <table className="admin-table w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">Código</th>
                    <th className="text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">Descuento</th>
                    <th className="text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">Período de Validez</th>
                    <th className="text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">Estado</th>
                    <th className="text-right px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((coupon) => {
                    const expired = isExpired(coupon);
                    const isCopied = copiedCode === coupon.code;
                    return (
                      <tr key={coupon.id} className="border-t border-[var(--dash-border)]">
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs bg-[var(--dash-surface-elevated)] text-[var(--dash-text)] px-2 py-1 rounded-md border border-[var(--dash-border)] tracking-wider">
                              {coupon.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(coupon.code)}
                              title="Copiar código del cupón"
                              className={`bg-transparent border-none cursor-pointer p-1 inline-flex items-center rounded transition-colors ${
                                isCopied ? "text-[var(--dash-success)]" : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                              }`}
                            >
                              {isCopied ? <Check size={13} /> : <Copy size={13} />}
                            </button>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-[var(--dash-accent)] text-sm">
                            {coupon.discountType === "percent"
                              ? `${coupon.discountValue}% OFF`
                              : `${formatPrice(coupon.discountValue)} OFF`}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="text-xs text-[var(--dash-muted)] flex items-center gap-1">
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
                        <td className="p-3.5">
                          {expired ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--dash-danger-bg)] text-[var(--dash-danger)] border border-[var(--dash-danger-border)]">
                              <XCircle size={12} />
                              Expirado
                            </span>
                          ) : coupon.active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--dash-success-bg)] text-[var(--dash-success)] border border-[var(--dash-success-border)]">
                              <CheckCircle2 size={12} />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)] border border-[var(--dash-border)]">
                              Pausado
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex gap-1.5 items-center">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(coupon)}
                              className="admin-btn admin-btn--secondary text-xs px-2 py-1"
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
            <div className="admin-mobile-only flex flex-col gap-3">
              {filteredCoupons.map((coupon, index) => {
                const expired = isExpired(coupon);
                const isCopied = copiedCode === coupon.code;
                return (
                  <div
                    key={coupon.id}
                    className="admin-row-in p-3.5 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl"
                    style={{ "--i": index } as React.CSSProperties}
                  >
                    {/* Header: Code + Copy + Status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs bg-[var(--dash-surface-elevated)] text-[var(--dash-text)] px-2 py-0.5 rounded border border-[var(--dash-border)] tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(coupon.code)}
                          title="Copiar código del cupón"
                          className={`bg-transparent border-none cursor-pointer p-1.5 inline-flex items-center rounded transition-colors ${
                            isCopied ? "text-[var(--dash-success)]" : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                          }`}
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>

                      {expired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--dash-danger-bg)] text-[var(--dash-danger)] border border-[var(--dash-danger-border)]">
                          <XCircle size={11} />
                          Expirado
                        </span>
                      ) : coupon.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--dash-success-bg)] text-[var(--dash-success)] border border-[var(--dash-success-border)]">
                          <CheckCircle2 size={11} />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)] border border-[var(--dash-border)]">
                          Pausado
                        </span>
                      )}
                    </div>

                    {/* Discount & Validity */}
                    <div className="flex items-center justify-between gap-2.5 my-2.5">
                      <span className="font-bold text-[var(--dash-accent)] text-base">
                        {coupon.discountType === "percent"
                          ? `${coupon.discountValue}% OFF`
                          : `${formatPrice(coupon.discountValue)} OFF`}
                      </span>

                      <div className="text-xs text-[var(--dash-muted)] flex items-center gap-1">
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
                    <div className="flex items-center justify-between border-t border-[var(--dash-border)] pt-2.5 mt-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(coupon)}
                        className="admin-btn admin-btn--secondary text-xs px-3 py-1.5"
                      >
                        {coupon.active ? "Pausar Cupón" : "Activar Cupón"}
                      </button>

                      <div className="flex gap-1.5">
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
