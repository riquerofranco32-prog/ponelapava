import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ValidationError } from "@/lib/validation";
import { getAdminUserByEmail, AdminUser, AdminRole } from "@/lib/adminUsers";

export * from "@/lib/validation";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export interface HandleOptions {
  requiredRole?: AdminRole;
  skipAuth?: boolean;
}

export async function getAuthenticatedAdmin(): Promise<AdminUser> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore in Route Handlers
          }
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    throw new AuthError("No autenticado", 401);
  }

  const admin = await getAdminUserByEmail(user.email);
  if (!admin || !admin.active) {
    throw new AuthError("Acceso denegado: usuario no autorizado o inactivo", 403);
  }

  return admin;
}

// Every /api/admin handler runs through this:
// 1. Authenticates against Supabase Auth session AND verifies admin_users table (must be active).
// 2. Checks requiredRole (e.g. 'owner') if specified, returning 403 if insufficient permissions.
// 3. Catches ValidationError (400) and unexpected errors (500).
export async function handle<T>(
  label: string,
  fn: (adminUser: AdminUser) => Promise<T>,
  options?: HandleOptions,
): Promise<NextResponse> {
  try {
    let adminUser: AdminUser | null = null;
    if (!options?.skipAuth) {
      adminUser = await getAuthenticatedAdmin();
      if (options?.requiredRole && adminUser.role !== options.requiredRole) {
        throw new AuthError("Acceso restringido a dueños (owner)", 403);
      }
    }
    return NextResponse.json(await fn(adminUser!));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(`[api] ${label} failed:`, error);
    const message =
      error instanceof Error ? error.message : "Error inesperado del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
