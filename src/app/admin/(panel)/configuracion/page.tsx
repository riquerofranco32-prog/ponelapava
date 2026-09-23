"use client";

import { useState } from "react";
import { Store, Users } from "lucide-react";
import SettingsForm from "@/components/admin/SettingsForm";
import { TeamSettingsSection } from "@/components/admin/team/TeamSettingsSection";
import { useAdminUser } from "@/context/AdminUserContext";

type ConfigTab = "store" | "team";

export default function AdminConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<ConfigTab>("store");
  const { isOwner } = useAdminUser();

  return (
    <div className="space-y-6">
      {/* Tabs Switcher (only show Equipo tab if user is Owner) */}
      {isOwner && (
        <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3">
          <div className="inline-flex items-center bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-[var(--dash-radius-md)] p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("store")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--dash-radius-sm)] text-xs font-semibold cursor-pointer border-none transition-all ${
                activeTab === "store"
                  ? "bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-sm"
                  : "bg-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
              }`}
            >
              <Store size={15} />
              <span>Tienda y Pagos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("team")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--dash-radius-sm)] text-xs font-semibold cursor-pointer border-none transition-all ${
                activeTab === "team"
                  ? "bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-sm"
                  : "bg-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
              }`}
            >
              <Users size={15} />
              <span>Equipo y Roles</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "store" ? <SettingsForm /> : <TeamSettingsSection />}
    </div>
  );
}

