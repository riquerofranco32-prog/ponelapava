"use client";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger";

export function AdminButton({
  variant = "primary",
  disabled,
  fullWidth,
  children,
  onClick,
  type = "button",
  form,
}: {
  variant?: Variant;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  form?: string;
}) {
  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "admin-btn",
        `admin-btn--${disabled ? "secondary" : variant}`,
        fullWidth && "admin-btn--full",
      )}
    >
      {children}
    </button>
  );
}
