import { NextRequest, NextResponse } from "next/server";

// Gates /admin behind HTTP Basic Auth. The page itself has no auth, no real
// backend, and mock data — it's not ready to be public. If ADMIN_PASSWORD
// isn't set, /admin 404s instead of silently staying open.
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
  matcher: "/admin/:path*",
};
