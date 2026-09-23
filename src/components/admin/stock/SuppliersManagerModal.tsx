"use client";

import { useEffect, useState } from "react";
import { Truck, Plus, Trash2, Edit2, Phone, Mail, User } from "lucide-react";
import { Supplier, SupplierInput } from "@/types";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminField } from "@/components/admin/AdminField";
import { useAdminToast } from "@/components/admin/AdminToast";

interface SuppliersManagerModalProps {
  onClose: () => void;
  onSuppliersChanged?: () => void;
}

export function SuppliersManagerModal({
  onClose,
  onSuppliersChanged,
}: SuppliersManagerModalProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const showToast = useAdminToast();

  async function loadSuppliers() {
    try {
      const res = await fetch("/api/admin/suppliers");
      if (!res.ok) throw new Error("Error al cargar proveedores");
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  function startEdit(s: Supplier) {
    setEditingSupplier(s);
    setIsAdding(false);
    setName(s.name);
    setContactName(s.contactName || "");
    setPhone(s.phone || "");
    setEmail(s.email || "");
    setNotes(s.notes || "");
  }

  function startAdd() {
    setEditingSupplier(null);
    setIsAdding(true);
    setName("");
    setContactName("");
    setPhone("");
    setEmail("");
    setNotes("");
  }

  function cancelForm() {
    setEditingSupplier(null);
    setIsAdding(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const payload: SupplierInput = {
        name: name.trim(),
        contactName: contactName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const url = editingSupplier
        ? `/api/admin/suppliers/${editingSupplier.id}`
        : "/api/admin/suppliers";
      const method = editingSupplier ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al guardar proveedor");
      }

      showToast(editingSupplier ? "Proveedor actualizado" : "Proveedor creado");
      cancelForm();
      await loadSuppliers();
      onSuppliersChanged?.();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(s: Supplier) {
    if (!window.confirm(`¿Seguro que querés eliminar al proveedor "${s.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/suppliers/${s.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al eliminar");
      }
      showToast("Proveedor eliminado");
      await loadSuppliers();
      onSuppliersChanged?.();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  return (
    <AdminModal
      title="Gestión de Proveedores"
      onClose={onClose}
      maxWidth={680}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="admin-btn admin-btn--secondary"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Barra superior con botón nuevo */}
        {!isAdding && !editingSupplier && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--dash-muted)]">
              {suppliers.length} proveedor{suppliers.length === 1 ? "" : "es"} registrado{suppliers.length === 1 ? "" : "s"}
            </span>
            <AdminButton onClick={startAdd} className="!text-xs !py-1 !px-2.5">
              <Plus size={14} />
              <span>Nuevo proveedor</span>
            </AdminButton>
          </div>
        )}

        {/* Formulario de Alta / Edición */}
        {(isAdding || editingSupplier) && (
          <form
            onSubmit={handleSave}
            className="p-4 bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-[var(--dash-radius-md)] space-y-3"
          >
            <h4 className="text-xs font-bold text-[var(--dash-text)] uppercase tracking-wider m-0">
              {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AdminField label="Nombre de la empresa / Marca">
                <input
                  type="text"
                  required
                  placeholder="Ej: Distribuidora Playadito"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="admin-input !text-xs"
                />
              </AdminField>

              <AdminField label="Nombre del contacto">
                <input
                  type="text"
                  placeholder="Ej: Juan Martínez"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="admin-input !text-xs"
                />
              </AdminField>

              <AdminField label="Teléfono / WhatsApp">
                <input
                  type="text"
                  placeholder="Ej: 2994123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="admin-input !text-xs"
                />
              </AdminField>

              <AdminField label="Email">
                <input
                  type="email"
                  placeholder="ventas@proveedor.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input !text-xs"
                />
              </AdminField>
            </div>

            <AdminField label="Notas internas">
              <textarea
                rows={2}
                placeholder="Días de entrega, mínimos de compra, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="admin-input !text-xs"
              />
            </AdminField>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={cancelForm}
                disabled={saving}
                className="admin-btn admin-btn--secondary !text-xs !py-1"
              >
                Cancelar
              </button>
              <AdminButton
                type="submit"
                disabled={saving || !name.trim()}
                className="!text-xs !py-1"
              >
                {saving ? "Guardando..." : "Guardar proveedor"}
              </AdminButton>
            </div>
          </form>
        )}

        {/* Lista de Proveedores */}
        {loading ? (
          <div className="p-6 text-center text-xs text-[var(--dash-muted)]">
            Cargando proveedores...
          </div>
        ) : suppliers.length === 0 && !isAdding ? (
          <div className="p-8 text-center text-xs text-[var(--dash-muted)] bg-[var(--dash-surface-2)] rounded-[var(--dash-radius-md)] border border-[var(--dash-border)]">
            <Truck size={24} className="mx-auto mb-2 opacity-40" />
            <p className="m-0 font-medium">Aún no registraste proveedores.</p>
            <p className="m-0 text-xs opacity-75 mt-1">
              Agregá a tus proveedores para asociarlos a los productos y enviar pedidos de reposición por WhatsApp.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {suppliers.map((s) => (
              <div
                key={s.id}
                className="p-3 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[var(--dash-radius-md)] hover:bg-[var(--dash-surface-2)] transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[var(--dash-text)]">
                      {s.name}
                    </span>
                    {s.contactName && (
                      <span className="text-[var(--dash-muted)]">
                        ({s.contactName})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--dash-muted)] flex-wrap">
                    {s.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone size={12} /> {s.phone}
                      </span>
                    )}
                    {s.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail size={12} /> {s.email}
                      </span>
                    )}
                  </div>
                  {s.notes && (
                    <p className="m-0 text-[11px] text-[var(--dash-muted)] italic truncate">
                      {s.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(s)}
                    className="p-1.5 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors border-none bg-transparent cursor-pointer"
                    title="Editar proveedor"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s)}
                    className="p-1.5 text-[var(--dash-muted)] hover:text-[var(--dash-danger)] transition-colors border-none bg-transparent cursor-pointer"
                    title="Eliminar proveedor"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminModal>
  );
}
