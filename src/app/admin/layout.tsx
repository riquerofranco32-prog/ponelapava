import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { AdminUserProvider } from "@/context/AdminUserContext";
import { AdminToastProvider } from "@/components/admin/AdminToast";

import { getAdminUserByEmail } from "@/lib/adminUsers";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-suspenders — middleware already gates this route, this catches
  // anything that reaches the layout without a session (e.g. a stale cache).
  if (!user || !user.email) redirect("/login");

  const admin = await getAdminUserByEmail(user.email);
  if (!admin || !admin.active) {
    redirect("/login?error=unauthorized");
  }

  return (
    <AdminUserProvider email={admin.email} role={admin.role}>
      <AdminToastProvider>{children}</AdminToastProvider>
    </AdminUserProvider>
  );
}
