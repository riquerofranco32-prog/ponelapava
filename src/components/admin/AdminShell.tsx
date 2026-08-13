"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface AdminShellProps {
  children: React.ReactNode;
  navItems: AdminNavItem[];
  activeSection: string;
  onSectionChange: (id: string) => void;
}

const SIDEBAR_COLLAPSED_KEY = "pava-admin-sidebar-collapsed";
// Bottom tab bar only has room for a few items — cap at 4, matching the
// most-used sections (mirrors the sidebar order, no separate config needed).
const MOBILE_TAB_COUNT = 4;

export default function AdminShell({
  children,
  navItems,
  activeSection,
  onSectionChange,
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  function selectSection(id: string) {
    onSectionChange(id);
    setMobileOpen(false);
  }

  return (
    <div className="pava-admin" style={{ display: "flex" }}>
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
        <span
          style={{ fontWeight: 700, fontSize: 14, color: "var(--dash-text)" }}
        >
          Poné La Pava — Admin
        </span>
        <span style={{ width: 44 }} aria-hidden="true" />
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
          const isActive = item.id === activeSection;
          return (
            <button
              key={item.id}
              onClick={() => selectSection(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                textAlign: "left",
                color: isActive ? "#1e1b15" : "var(--dash-text)",
                background: isActive
                  ? "var(--dash-accent)"
                  : "var(--dash-surface-2)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <item.icon size={16} />
              {item.label}
            </button>
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
      </nav>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav
        className="flex lg:hidden"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          background: "var(--dash-surface)",
          borderTop: "1px solid var(--dash-border)",
        }}
      >
        {navItems.slice(0, MOBILE_TAB_COUNT).map((item) => {
          const isActive = item.id === activeSection;
          return (
            <button
              key={item.id}
              onClick={() => selectSection(item.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "10px 4px",
                background: "none",
                border: "none",
                color: isActive ? "var(--dash-accent)" : "var(--dash-muted)",
                cursor: "pointer",
              }}
            >
              <item.icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>
                {item.label}
              </span>
            </button>
          );
        })}
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
            <span
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--dash-text)",
              }}
            >
              Poné La Pava
            </span>
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
          {navItems.map((item) => {
            const isActive = item.id === activeSection;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={isActive ? undefined : "admin-nav-link"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "10px 0" : "10px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#1e1b15" : "var(--dash-muted)",
                  background: isActive ? "var(--dash-accent)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  textAlign: "left",
                }}
              >
                <item.icon size={16} />
                {!collapsed && item.label}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            padding: "12px 8px",
            borderTop: "1px solid var(--dash-border)",
          }}
        >
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
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main
        style={{
          flex: 1,
          minHeight: "100vh",
          paddingTop: "calc(56px + 20px)",
          paddingBottom: "calc(64px + 20px)",
          paddingLeft: 16,
          paddingRight: 16,
        }}
        className="lg:pt-8 lg:pb-8 lg:px-8"
      >
        <div
          className="lg:ml-0"
          style={{
            marginLeft: 0,
          }}
        >
          {children}
        </div>
      </main>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (min-width: 1024px) {
          .pava-admin main {
            margin-left: ${collapsed ? 64 : 232}px;
            transition: margin-left 0.2s ease;
          }
        }
      `,
        }}
      />
    </div>
  );
}
