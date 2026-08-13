"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { AdminField } from "@/components/admin/AdminField";
import { AdminButton } from "@/components/admin/AdminButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      const msg = authError.message.toLowerCase();
      setError(
        msg.includes("invalid login") || msg.includes("invalid credentials")
          ? "Email o contraseña incorrectos."
          : "No se pudo iniciar sesión. Probá de nuevo.",
      );
      setLoading(false);
      return;
    }

    // Hard navigation so the server picks up the new session cookie.
    window.location.href = "/admin";
  }

  return (
    <div
      className="pava-admin"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <span
            style={{
              position: "relative",
              display: "block",
              width: 56,
              height: 56,
              borderRadius: "50%",
              overflow: "hidden",
            }}
          >
            <Image
              src="/logo.png"
              alt=""
              fill
              sizes="56px"
              style={{ objectFit: "cover" }}
            />
          </span>
        </div>

        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--dash-text)",
              marginBottom: 6,
            }}
          >
            Panel de administración
          </h1>
          <p style={{ fontSize: 13, color: "var(--dash-muted)" }}>
            Ingresá con tu cuenta para continuar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <AdminField label="Email">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="admin-input"
            />
          </AdminField>

          <AdminField label="Contraseña">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="admin-input"
            />
          </AdminField>

          {error && (
            <p
              style={{
                fontSize: 13,
                textAlign: "center",
                color: "var(--dash-danger)",
                background: "var(--dash-danger-bg)",
                border: "1px solid var(--dash-danger-border)",
                borderRadius: 8,
                padding: "8px 12px",
              }}
            >
              {error}
            </p>
          )}

          <AdminButton type="submit" disabled={loading} fullWidth>
            {loading ? "Ingresando..." : "Ingresar"}
          </AdminButton>
        </form>
      </div>
    </div>
  );
}
