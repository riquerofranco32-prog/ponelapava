import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Gates /admin and its API routes behind a real Supabase Auth session
// (replaces the old shared-password HTTP Basic Auth). Single-owner store,
// so any authenticated user in this Supabase project is the admin — no
// roles/tenants to check.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    if (request.nextUrl.pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check admin_users table: must be present and active
  const email = user.email.toLowerCase().trim();
  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("role, active")
    .eq("email", email)
    .maybeSingle();

  const isAuthorized = !adminError && adminUser && adminUser.active;

  if (!isAuthorized) {
    if (request.nextUrl.pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { error: "Acceso denegado: usuario no autorizado o inactivo" },
        { status: 403 }
      );
    }

    // Sign out: clear session cookies and redirect to /login
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("error", "unauthorized");
    const redirectResponse = NextResponse.redirect(redirectUrl);
    request.cookies.getAll().forEach((c) => {
      if (c.name.includes("sb-") || c.name.includes("supabase")) {
        redirectResponse.cookies.delete(c.name);
      }
    });
    return redirectResponse;
  }

  // Staff role restrictions in UI: staff cannot access settings, reports, coupons
  if (adminUser.role === "staff") {
    const pathname = request.nextUrl.pathname;
    if (
      pathname.startsWith("/admin/configuracion") ||
      pathname.startsWith("/admin/reportes") ||
      pathname.startsWith("/admin/cupones")
    ) {
      return NextResponse.redirect(new URL("/admin/pedidos", request.url));
    }
  }

  response.headers.set("x-admin-role", adminUser.role);
  response.headers.set("x-admin-email", email);
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
