"use client";

import { cn } from "@/lib/utils";

export function IconButton({
  onClick,
  title,
  icon: Icon,
  danger = false,
}: {
  onClick: () => void;
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn("admin-icon-btn", danger && "admin-icon-btn--danger")}
    >
      <Icon size={13} />
    </button>
  );
}
