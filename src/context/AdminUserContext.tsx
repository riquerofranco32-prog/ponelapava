"use client";

import { createContext, useContext } from "react";
import type { AdminRole } from "@/lib/adminUsers";

export interface AdminUserContextValue {
  email: string;
  role: AdminRole;
  isOwner: boolean;
  isStaff: boolean;
}

const AdminUserContext = createContext<AdminUserContextValue | null>(null);

export function AdminUserProvider({
  email,
  role = "staff",
  children,
}: {
  email: string;
  role?: AdminRole;
  children: React.ReactNode;
}) {
  const value: AdminUserContextValue = {
    email,
    role,
    isOwner: role === "owner",
    isStaff: role === "staff",
  };

  return (
    <AdminUserContext.Provider value={value}>
      {children}
    </AdminUserContext.Provider>
  );
}

export function useAdminUser(): AdminUserContextValue {
  const context = useContext(AdminUserContext);
  if (!context) {
    throw new Error("useAdminUser must be used within AdminUserProvider");
  }
  return context;
}

export function useAdminUserEmail(): string {
  return useAdminUser().email;
}
