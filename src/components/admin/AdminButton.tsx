"use client";

import { cn } from "@/lib/utils";

import { Button, type ButtonProps } from "./ui/Button";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export interface AdminButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: Variant;
}

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
  size = "md",
  loading = false,
  className,
  ...rest
}: AdminButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      loading={loading}
      onClick={onClick}
      type={type}
      form={form}
      title={title}
      style={style}
      className={className}
      {...rest}
    >
      {children}
    </Button>
  );
}

export default AdminButton;
