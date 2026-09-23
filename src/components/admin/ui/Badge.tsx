import React from "react";
import {
  Clock,
  CheckCircle2,
  Package,
  PackageCheck,
  Truck,
  XCircle,
  AlertCircle,
  Crown,
  UserCheck,
  Sparkles,
  ArrowRightLeft,
  Banknote,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@/types";

export type BadgeVariant =
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = "neutral",
  icon,
  className = "",
  ...props
}: BadgeProps) {
  const variantClass = {
    accent: "admin-badge--accent",
    success: "admin-badge--success",
    warning: "admin-badge--warning",
    danger: "admin-badge--danger",
    info: "admin-badge--info",
    neutral: "admin-badge--neutral",
  }[variant];

  return (
    <span className={`admin-badge ${variantClass} ${className}`.trim()} {...props}>
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

// Single status-to-color & icon map for the entire CRM
export interface StatusPillProps {
  type: "order" | "payment" | "segment" | "payment_method" | "stock";
  value: string;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

export function StatusPill({
  type,
  value,
  label,
  showIcon = true,
  className = "",
}: StatusPillProps) {
  let variant: BadgeVariant = "neutral";
  let icon: React.ReactNode = null;
  let text = label || value;

  if (type === "order") {
    switch (value as OrderStatus) {
      case "pending":
        variant = "warning";
        icon = <Clock className="w-3 h-3 text-current" />;
        text = label || "Pendiente";
        break;
      case "confirmed":
        variant = "info";
        icon = <CheckCircle2 className="w-3 h-3 text-current" />;
        text = label || "Confirmado";
        break;
      case "preparing":
        variant = "accent";
        icon = <Package className="w-3 h-3 text-current" />;
        text = label || "En preparación";
        break;
      case "ready":
        variant = "info";
        icon = <PackageCheck className="w-3 h-3 text-current" />;
        text = label || "Listo para entrega";
        break;
      case "delivered":
        variant = "success";
        icon = <Truck className="w-3 h-3 text-current" />;
        text = label || "Entregado";
        break;
      case "cancelled":
        variant = "danger";
        icon = <XCircle className="w-3 h-3 text-current" />;
        text = label || "Cancelado";
        break;
    }
  } else if (type === "payment") {
    switch (value as PaymentStatus) {
      case "paid":
        variant = "success";
        icon = <CheckCircle2 className="w-3 h-3 text-current" />;
        text = label || "Cobrado";
        break;
      case "unpaid":
      default:
        variant = "danger";
        icon = <AlertCircle className="w-3 h-3 text-current" />;
        text = label || "Sin cobrar";
        break;
    }
  } else if (type === "segment") {
    switch (value) {
      case "vip":
        variant = "accent";
        icon = <Crown className="w-3 h-3 text-current" />;
        text = label || "VIP";
        break;
      case "recurrent":
        variant = "info";
        icon = <UserCheck className="w-3 h-3 text-current" />;
        text = label || "Recurrente";
        break;
      case "new":
        variant = "success";
        icon = <Sparkles className="w-3 h-3 text-current" />;
        text = label || "Nuevo";
        break;
      case "risk":
        variant = "danger";
        icon = <AlertTriangle className="w-3 h-3 text-current" />;
        text = label || "En riesgo";
        break;
      case "inactive":
      default:
        variant = "neutral";
        icon = <Clock className="w-3 h-3 text-current" />;
        text = label || "Inactivo";
        break;
    }
  } else if (type === "payment_method") {
    switch (value) {
      case "transfer":
        variant = "info";
        icon = <ArrowRightLeft className="w-3 h-3 text-current" />;
        text = label || "Transferencia";
        break;
      case "cash":
        variant = "success";
        icon = <Banknote className="w-3 h-3 text-current" />;
        text = label || "Efectivo";
        break;
      case "card":
        variant = "accent";
        icon = <CreditCard className="w-3 h-3 text-current" />;
        text = label || "Mercado Pago";
        break;
    }
  } else if (type === "stock") {
    const stockNum = Number(value);
    if (stockNum <= 0) {
      variant = "danger";
      icon = <AlertCircle className="w-3 h-3 text-current" />;
      text = label || "Sin stock";
    } else if (stockNum <= 3) {
      variant = "warning";
      icon = <AlertTriangle className="w-3 h-3 text-current" />;
      text = label || `Bajo (${stockNum})`;
    } else {
      variant = "success";
      text = label || `${stockNum} u.`;
    }
  }

  return (
    <Badge variant={variant} icon={showIcon ? icon : undefined} className={className}>
      {text}
    </Badge>
  );
}

export default Badge;
