import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
}

export default function PageHeader({
  eyebrow,
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="bg-pava-green pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-pava-gold" />
          <span className="text-xs tracking-[0.2em] uppercase text-pava-gold font-medium">
            {eyebrow}
          </span>
        </div>
        <h1 className="font-display text-5xl lg:text-6xl font-bold text-pava-cream">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-pava-cream/70 max-w-lg">{description}</p>
        )}
      </div>
    </div>
  );
}
