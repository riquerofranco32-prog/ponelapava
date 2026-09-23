"use client";

import { useEffect, useState } from "react";
import { UserPlus, Shield, User, CheckCircle2, XCircle, MoreVertical } from "lucide-react";
import { AdminUser, AdminRole } from "@/lib/adminUsers";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminField } from "@/components/admin/AdminField";
import { useAdminToast } from "@/components/admin/AdminToast";
import { useAdminUser } from "@/context/AdminUserContext";

export function TeamSettingsSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRole>("staff");
  const [inviting, setInviting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const showToast = useAdminToast();
  const { email: currentEmail, isOwner } = useAdminUser();

  async function loadTeam() {
    try {
      const res = await fetch("/api/admin/team");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo cargar el equipo");
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al cargar equipo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeam();
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al invitar usuario");
      }
      showToast(`Usuario ${data.email} agregado con éxito`);
      setInviteEmail("");
      setInviteRole("staff");
      loadTeam();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al agregar usuario");
    } finally {
      setInviting(false);
    }
  }

  async function handleToggleRole(u: AdminUser) {
    const nextRole: AdminRole = u.role === "owner" ? "staff" : "owner";
    const confirmMsg =
      nextRole === "staff"
        ? `¿Seguro que querés quitar permisos de Dueño a ${u.email}?`
        : `¿Seguro que querés promover a Dueño a ${u.email}?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(u.id);
    try {
      const res = await fetch(`/api/admin/team/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al cambiar rol");
      }
      showToast(`Rol actualizado a ${nextRole === "owner" ? "Dueño" : "Staff"}`);
      loadTeam();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al cambiar rol");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleToggleActive(u: AdminUser) {
    const nextActive = !u.active;
    const confirmMsg = nextActive
      ? `¿Reactivar acceso a ${u.email}?`
      : `¿Desactivar acceso a ${u.email}? No podrá iniciar sesión en el panel.`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(u.id);
    try {
      const res = await fetch(`/api/admin/team/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar estado");
      }
      showToast(nextActive ? "Usuario activado" : "Usuario desactivado");
      loadTeam();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al actualizar estado");
    } finally {
      setActionLoadingId(null);
    }
  }

  if (!isOwner) {
    return (
      <div className="bg-[var(--dash-danger-bg)] border border-[var(--dash-danger-border)] rounded-[var(--dash-radius-md)] p-4 text-sm text-[var(--dash-danger)]">
        Acceso restringido: Sólo los dueños pueden administrar los usuarios del equipo.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulario para invitar miembro */}
      <AdminCard className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus size={16} className="text-[var(--dash-accent)]" />
          <h3 className="text-sm font-bold text-[var(--dash-text)] m-0">
            Invitar miembro al equipo
          </h3>
        </div>
        <p className="text-xs text-[var(--dash-muted)] mb-4">
          Agregá el email de tu empleado o socio. Al iniciar sesión con Supabase Auth con este email, tendrá acceso según el rol asignado.
        </p>

        <form onSubmit={handleInvite} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <AdminField label="Email">
              <input
                type="email"
                required
                placeholder="ejemplo@gmail.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="admin-input !text-xs"
              />
            </AdminField>
          </div>

          <div className="w-[180px]">
            <AdminField label="Rol">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                className="admin-input !text-xs"
              >
                <option value="staff">Staff (Operativo)</option>
                <option value="owner">Dueño (Total)</option>
              </select>
            </AdminField>
          </div>

          <AdminButton type="submit" disabled={inviting || !inviteEmail.trim()}>
            {inviting ? "Agregando..." : "Agregar miembro"}
          </AdminButton>
        </form>
      </AdminCard>

      {/* Lista de Miembros */}
      <AdminCard className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--dash-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[var(--dash-accent)]" />
            <h3 className="text-sm font-bold text-[var(--dash-text)] m-0">
              Miembros actuales ({users.length})
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-center text-xs text-[var(--dash-muted)]">
            Cargando miembros del equipo...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--dash-muted)]">
            No hay miembros registrados aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--dash-border)] bg-[var(--dash-surface-2)]">
                  <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">
                    Usuario
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">
                    Rol
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">
                    Estado
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">
                    Alta
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrent = u.email === currentEmail;
                  const isProcessing = actionLoadingId === u.id;

                  return (
                    <tr
                      key={u.id}
                      className="border-b border-[var(--dash-border-subtle)] hover:bg-[var(--dash-surface-2)] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-[var(--dash-surface-3)] text-[var(--dash-text)] flex items-center justify-center text-xs font-bold">
                            {u.email.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <span className="font-medium text-xs sm:text-sm text-[var(--dash-text)]">
                              {u.email}
                            </span>
                            {isCurrent && (
                              <span className="ml-2 text-xs text-[var(--dash-accent)] font-semibold">
                                (Vos)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                            u.role === "owner"
                              ? "bg-[var(--dash-accent-subtle)] text-[var(--dash-accent)] border border-[var(--dash-accent-border)]"
                              : "bg-[var(--dash-surface-3)] text-[var(--dash-text)] border border-[var(--dash-border)]"
                          }`}
                        >
                          {u.role === "owner" ? "Dueño" : "Staff"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            u.active
                              ? "text-[var(--dash-success)]"
                              : "text-[var(--dash-muted)]"
                          }`}
                        >
                          {u.active ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={13} />
                              <span>Inactivo</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-[var(--dash-muted)] whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleRole(u)}
                            disabled={isProcessing}
                            className="admin-btn admin-btn--secondary !text-xs !py-1 !px-2"
                            title={
                              u.role === "owner"
                                ? "Cambiar a rol Staff"
                                : "Promover a rol Dueño"
                            }
                          >
                            {u.role === "owner" ? "Hacer Staff" : "Hacer Dueño"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleActive(u)}
                            disabled={isProcessing || isCurrent}
                            className={`admin-btn !text-xs !py-1 !px-2 ${
                              u.active ? "admin-btn--danger" : "admin-btn--secondary"
                            }`}
                            title={u.active ? "Desactivar usuario" : "Activar usuario"}
                          >
                            {u.active ? "Desactivar" : "Activar"}
                          </button>
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
    </div>
  );
}
