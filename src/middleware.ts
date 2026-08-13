import { NextRequest, NextResponse } from "next/server";

// Gates /admin and its API routes behind HTTP Basic Auth — the dashboard
// has no auth of its own. If ADMIN_PASSWORD isn't set, /admin 404s instead
// of silently staying open.
export function middleware(request: NextRequest) {
  const adminUser = process.env.ADMIN_USER || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return new NextResponse("Not found", { status: 404 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const [user, password] = atob(encoded).split(":");
      if (user === adminUser && password === adminPassword) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Autenticación requerida.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
