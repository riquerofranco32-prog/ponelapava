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
  title,
  style,
}: {
  variant?: Variant;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  form?: string;
  title?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type={type}
      form={form}
      title={title}
      style={style}
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
