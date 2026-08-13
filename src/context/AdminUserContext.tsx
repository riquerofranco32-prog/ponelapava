"use client";

import { createContext, useContext } from "react";

const AdminUserContext = createContext<string | null>(null);

export function AdminUserProvider({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <AdminUserContext.Provider value={email}>
      {children}
    </AdminUserContext.Provider>
  );
}

export function useAdminUserEmail(): string {
  const email = useContext(AdminUserContext);
  if (email === null) {
    throw new Error("useAdminUserEmail must be used within AdminUserProvider");
  }
  return email;
}
