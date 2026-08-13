import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "available" | "out_of_stock" | "featured" | "category" | "custom";
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<string, string> = {
  available: "bg-pava-green/10 text-pava-green border border-pava-green/20",
  out_of_stock: "bg-pava-terracotta/10 text-pava-terracotta border border-pava-terracotta/20",
  featured: "bg-pava-gold text-pava-brown border border-pava-gold",
  category: "bg-pava-cream-dark text-pava-brown-mid border border-pava-brown/10",
  custom: "",
};

export default function Badge({ variant = "category", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-chip px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
