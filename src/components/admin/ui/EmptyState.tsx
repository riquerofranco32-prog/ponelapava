import React from "react";
import Link from "next/link";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`admin-card flex flex-col items-center justify-center text-center py-12 px-6 ${className}`.trim()}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-accent)] mb-4 shrink-0 shadow-sm">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--dash-text)] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--dash-muted)] max-w-sm mb-5">
        {description}
      </p>

      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant="primary" size="sm" icon={action.icon}>
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button variant="primary" size="sm" onClick={action.onClick} icon={action.icon}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}

export default EmptyState;
