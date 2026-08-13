import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { AdminUserProvider } from "@/context/AdminUserContext";

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
  if (!user) redirect("/login");

  return (
    <AdminUserProvider email={user.email ?? ""}>{children}</AdminUserProvider>
  );
}
