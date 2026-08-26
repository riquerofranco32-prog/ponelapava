"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, ExternalLink, LogOut, Search, Volume2, VolumeX } from "lucide-react";
import { useAdminUserEmail } from "@/context/AdminUserContext";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { playOrderChime } from "@/lib/audioAlert";
import PendingOrdersBadge from "@/components/admin/PendingOrdersBadge";
import AdminCommandPalette from "@/components/admin/AdminCommandPalette";
import AdminShortcutsModal from "@/components/admin/AdminShortcutsModal";
import { type AdminNavItem, ADMIN_NAV_ITEMS } from "@/lib/admin-nav";

export type { AdminNavItem };

interface AdminShellProps {
  children: React.ReactNode;
  navItems?: AdminNavItem[];
}

const SIDEBAR_COLLAPSED_KEY = "pava-admin-sidebar-collapsed";
const SOUND_ENABLED_KEY = "pava-admin-sound-enabled";
// Bottom tab bar only has room for a few items — cap at 4, matching the
// most-used sections (mirrors the sidebar order, no separate config needed).
const MOBILE_TAB_COUNT = 4;

export default function AdminShell({
  children,
  navItems = ADMIN_NAV_ITEMS,
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clockTime, setClockTime] = useState<string | null>(null);
  const prevCountRef = useRef<number | null>(null);
  const email = useAdminUserEmail();
  const pathname = usePathname();
  const activeItem =
    navItems.find((item) => pathname?.startsWith(item.href)) ?? navItems[0];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SOUND_ENABLED_KEY);
      if (saved !== null) {
        setSoundEnabled(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  function toggleSound() {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_ENABLED_KEY, String(next));
      } catch {
        // ignore
      }
      if (next) {
        playOrderChime();
      }
      return next;
    });
  }

  // Poll for incoming orders and trigger pleasant chime when a new order arrives
  useEffect(() => {
    let mounted = true;
    async function checkPendingOrders() {
      try {
        const res = await fetch("/api/admin/orders/pending-count");
        if (!res.ok) return;
        const data = await res.json();
        const currentCount = Number(data.count ?? 0);

        if (prevCountRef.current !== null && currentCount > prevCountRef.current) {
          if (soundEnabled) {
            playOrderChime();
          }
        }
        if (mounted) {
          prevCountRef.current = currentCount;
        }
      } catch {
        // ignore
      }
    }

    checkPendingOrders();
    const interval = setInterval(checkPendingOrders, 20_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [soundEnabled]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === "?" && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShortcutsOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    function tick() {
      setClockTime(
        new Date().toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  useEffect(() => {
    if (localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true") {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarWidth = collapsed ? "64px" : "232px";

  return (
    <div
      className="pava-admin"
      style={
        {
          display: "flex",
          "--admin-sidebar-w": sidebarWidth,
        } as React.CSSProperties
      }
    >
      {/* ── MOBILE TOP BAR ── */}
      <header
        className="lg:hidden flex items-center justify-between"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "var(--dash-surface)",
          borderBottom: "1px solid var(--dash-border)",
          zIndex: 60,
          minHeight: 56,
          paddingLeft: 4,
          paddingRight: 12,
        }}
      >
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Abrir menú"
          style={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--dash-text)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {mobileOpen ? (
              <path
                d="M4 4L16 16M16 4L4 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M2 5h16M2 10h16M2 15h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "var(--dash-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {activeItem.label}
          </span>
          <span style={{ fontSize: 11, color: "var(--dash-muted)" }}>•</span>
          <span style={{ fontSize: 11, color: "var(--dash-accent)", fontWeight: 600 }}>
            Admin
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? "Silenciar timbre de pedidos" : "Activar timbre de pedidos"}
            title={soundEnabled ? "Timbre de pedidos activado" : "Timbre silenciado"}
            style={{
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: soundEnabled ? "var(--dash-accent)" : "var(--dash-muted)",
              borderRadius: 8,
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            onClick={() => setPaletteOpen(true)}
            aria-label="Buscar"
            style={{
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--dash-text)",
              borderRadius: 8,
            }}
          >
            <Search size={18} />
          </button>
        </div>
      </header>

      {/* ── MOBILE OVERLAY + DROPDOWN ── */}
      {mobileOpen && (
        <div
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.5)",
          }}
        />
      )}
      <nav
        className="lg:hidden"
        style={{
          position: "fixed",
          top: 56,
          left: 0,
          right: 0,
          background: "var(--dash-surface)",
          borderBottom: mobileOpen ? "1px solid var(--dash-border)" : "none",
          zIndex: 55,
          padding: mobileOpen ? "12px" : 0,
          maxHeight: mobileOpen ? "calc(100vh - 56px)" : 0,
          opacity: mobileOpen ? 1 : 0,
          overflow: "hidden",
          transition: "all 0.25s ease",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {navItems.map((item) => {
          const isActive = item.href === activeItem.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive ? "page" : undefined}
              className="admin-nav-item"
              style={{ padding: "12px 14px" }}
            >
              <item.icon size={16} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.href === "/admin/pedidos" && <PendingOrdersBadge />}
            </Link>
          );
        })}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            marginTop: 4,
            borderRadius: 8,
            fontSize: 13,
            color: "var(--dash-muted)",
            textDecoration: "none",
          }}
        >
          <ExternalLink size={14} />
          Ver sitio
        </Link>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--dash-danger)",
            background: "none",
            border: "none",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </nav>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav
        className="flex lg:hidden items-center justify-around"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          background: "var(--dash-surface)",
          borderTop: "1px solid var(--dash-border)",
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
          backdropFilter: "blur(12px)",
        }}
      >
        {[
          navItems.find((i) => i.href === "/admin/dashboard"),
          navItems.find((i) => i.href === "/admin/productos"),
          navItems.find((i) => i.href === "/admin/pedidos"),
          navItems.find((i) => i.href === "/admin/clientes"),
        ]
          .filter((i): i is NonNullable<typeof i> => Boolean(i))
          .map((item) => {
            const isActive = item.href === activeItem.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  padding: "8px 2px",
                  background: "none",
                  border: "none",
                  color: isActive ? "var(--dash-accent)" : "var(--dash-muted)",
                  textDecoration: "none",
                  cursor: "pointer",
                  minHeight: 48,
                  transition: "color 0.18s ease",
                }}
              >
                <span style={{ position: "relative", display: "flex" }}>
                  <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  {item.href === "/admin/pedidos" && (
                    <PendingOrdersBadge collapsed />
                  )}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: "0.02em",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

        {/* 5th button: Menú / Más */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Más secciones del panel"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            padding: "8px 2px",
            background: "none",
            border: "none",
            color: mobileOpen ? "var(--dash-accent)" : "var(--dash-muted)",
            cursor: "pointer",
            minHeight: 48,
            transition: "color 0.18s ease",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 6h14M3 10h14M3 14h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span style={{ fontSize: 10, fontWeight: mobileOpen ? 700 : 500 }}>
            Más
          </span>
        </button>
      </nav>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden lg:flex lg:flex-col"
        style={{
          width: collapsed ? 64 : 232,
          minHeight: "100vh",
          background: "var(--dash-surface)",
          borderRight: "1px solid var(--dash-border)",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transition: "width 0.2s ease",
          overflow: "hidden",
        }}
      >
        {/* Gold accent line at the very top of the sidebar */}
        <div className="admin-top-accent" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: collapsed ? "18px 0" : "18px 16px",
            borderBottom: "1px solid var(--dash-border)",
            minHeight: 64,
          }}
        >
          {!collapsed && (
            <div>
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--dash-text)",
                }}
              >
                Poné La Pava
              </span>
              {clockTime && (
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: "var(--dash-muted)",
                    fontVariantNumeric: "tabular-nums",
                    marginTop: 1,
                  }}
                >
                  {clockTime}
                </span>
              )}
            </div>
          )}
          <button
            onClick={() => {
              const next = !collapsed;
              setCollapsed(next);
              localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
            }}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--dash-muted)",
              display: "flex",
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav
          style={{
            flex: 1,
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            title={collapsed ? "Buscar (Ctrl+K)" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: collapsed ? "8px 0" : "8px 10px",
              justifyContent: collapsed ? "center" : "space-between",
              borderRadius: "var(--radius-control)",
              background: "var(--dash-surface-elevated)",
              border: "1px solid var(--dash-border)",
              color: "var(--dash-text-muted)",
              fontSize: 12,
              cursor: "pointer",
              marginBottom: 8,
              transition: "border-color 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Search size={14} />
              {!collapsed && <span>Buscar...</span>}
            </div>
            {!collapsed && (
              <kbd
                style={{
                  fontSize: 10,
                  padding: "1px 5px",
                  borderRadius: 4,
                  background: "var(--dash-surface)",
                  border: "1px solid var(--dash-border)",
                  fontFamily: "monospace",
                }}
              >
                ⌘K
              </kbd>
            )}
          </button>

          {navItems.map((item) => {
            const isActive = item.href === activeItem.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className="admin-nav-item"
                style={{
                  padding: collapsed ? "10px 0" : "10px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  position: collapsed ? "relative" : undefined,
                }}
              >
                <item.icon size={16} />
                {collapsed ? (
                  item.href === "/admin/pedidos" && (
                    <PendingOrdersBadge collapsed />
                  )
                ) : (
                  <>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.href === "/admin/pedidos" && <PendingOrdersBadge />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            padding: "12px 8px",
            borderTop: "1px solid var(--dash-border)",
          }}
        >
          {!collapsed && (
            <div
              style={{
                padding: "0 12px 8px",
                fontSize: 11,
                color: "var(--dash-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={email}
            >
              {email}
            </div>
          )}
          <Link
            href="/"
            title={collapsed ? "Ver sitio" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: collapsed ? "10px 0" : "10px 12px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--dash-muted)",
              textDecoration: "none",
            }}
          >
            <ExternalLink size={14} />
            {!collapsed && "Ver sitio"}
          </Link>
          <button
            onClick={handleLogout}
            title={collapsed ? "Cerrar sesión" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: collapsed ? "10px 0" : "10px 12px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--dash-danger)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <LogOut size={14} />
            {!collapsed && "Cerrar sesión"}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main
        style={{
          flex: 1,
          minHeight: "100vh",
          paddingTop: "calc(56px + 14px)",
          paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px) + 20px)",
          paddingLeft: "max(12px, env(safe-area-inset-left, 0px))",
          paddingRight: "max(12px, env(safe-area-inset-right, 0px))",
        }}
        className="lg:pt-6 lg:pb-10 lg:px-10"
      >
        {/* Desktop Sticky Glass Top Bar */}
        <div
          className="hidden lg:flex items-center justify-between"
          style={{
            position: "sticky",
            top: 12,
            zIndex: 40,
            marginBottom: 24,
            padding: "10px 18px",
            borderRadius: 12,
            background: "rgba(24, 43, 29, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--dash-border)",
            boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Left: Breadcrumbs & Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--dash-muted)" }}>
              <span>Admin</span>
              <span>/</span>
              <span style={{ color: "var(--dash-text)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <activeItem.icon size={15} style={{ color: "var(--dash-accent)" }} />
                {activeItem.label}
              </span>
            </div>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "2px 8px",
                borderRadius: 999,
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                fontSize: 11,
                fontWeight: 600,
                color: "#10b981",
              }}
            >
              <span className="admin-live-dot admin-live-dot--success" style={{ width: 6, height: 6 }} />
              Local & Web En Línea
            </span>
          </div>

          {/* Right: Quick actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="admin-btn admin-btn--secondary"
              style={{
                fontSize: 12,
                padding: "5px 10px",
                height: 32,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Search size={13} />
              <span>Buscar...</span>
              <kbd
                style={{
                  fontSize: 10,
                  padding: "0 4px",
                  borderRadius: 4,
                  background: "var(--dash-surface-3)",
                  border: "1px solid var(--dash-border)",
                  fontFamily: "monospace",
                }}
              >
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={toggleSound}
              className="admin-btn admin-btn--secondary"
              style={{
                fontSize: 12,
                padding: "0 10px",
                height: 32,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: soundEnabled ? "var(--dash-accent)" : "var(--dash-muted)",
              }}
              title={soundEnabled ? "Timbre de pedidos activado (Click para silenciar)" : "Timbre de pedidos silenciado (Click para activar)"}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="hidden xl:inline">{soundEnabled ? "Alertas ON" : "Silenciado"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              className="admin-btn admin-btn--secondary"
              style={{
                fontSize: 12,
                padding: "0",
                width: 32,
                height: 32,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Atajos de teclado (?)"
            >
              <span style={{ fontWeight: 700, fontSize: 13 }}>?</span>
            </button>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn--primary"
              style={{
                fontSize: 12,
                padding: "5px 12px",
                height: 32,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ExternalLink size={13} />
              <span>Ver Tienda</span>
            </Link>
          </div>
        </div>

        <div key={pathname} className="admin-section-in">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h1
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: 24,
                fontWeight: 700,
                color: "var(--dash-text)",
                margin: 0,
                textTransform: "capitalize",
              }}
            >
              {activeItem.label}
            </h1>
          </div>
          {children}
        </div>
      </main>

      {/* Global Command Palette */}
      <AdminCommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />

      {/* Global Shortcuts Modal */}
      <AdminShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
