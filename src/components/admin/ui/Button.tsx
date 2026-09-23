import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: "admin-btn--primary",
    secondary: "admin-btn--secondary",
    ghost: "admin-btn--ghost",
    danger: "admin-btn--danger",
  }[variant];

  const sizeClass = size === "sm" ? "admin-btn--sm" : "admin-btn--md";
  const fullClass = fullWidth ? "admin-btn--full" : "";

  return (
    <button
      disabled={disabled || loading}
      className={`admin-btn ${variantClass} ${sizeClass} ${fullClass} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}

export default Button;
