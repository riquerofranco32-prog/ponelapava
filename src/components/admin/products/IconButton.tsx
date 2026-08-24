"use client";

import { cn } from "@/lib/utils";

export function IconButton({
  onClick,
  title,
  icon: Icon,
  danger = false,
  disabled = false,
}: {
  onClick: () => void;
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={cn("admin-icon-btn", danger && "admin-icon-btn--danger")}
      style={disabled ? { opacity: 0.5, cursor: "default" } : undefined}
    >
      <Icon size={13} />
    </button>
  );
}
