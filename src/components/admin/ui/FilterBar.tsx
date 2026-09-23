import React from "react";
import { Search, X } from "lucide-react";

export interface FilterChip {
  id: string;
  label: string;
  count?: number;
}

export interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  chips?: FilterChip[];
  activeChip?: string;
  onChipChange?: (chipId: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  chips = [],
  activeChip,
  onChipChange,
  children,
  className = "",
}: FilterBarProps) {
  return (
    <div className={`admin-filterbar ${className}`.trim()}>
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dash-muted)] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="admin-input pl-9 pr-8 py-2 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => {
            const isActive = activeChip === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onChipChange?.(chip.id)}
                className={`admin-toolbar-pill ${isActive ? "admin-toolbar-pill--active" : ""}`}
              >
                <span>{chip.label}</span>
                {chip.count !== undefined && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-[var(--dash-bg)]/20 text-[var(--dash-bg)]"
                        : "bg-[var(--dash-surface-3)] text-[var(--dash-muted)]"
                    }`}
                  >
                    {chip.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Extra actions / controls */}
      {children && (
        <div className="flex items-center gap-2 ml-auto">
          {children}
        </div>
      )}
    </div>
  );
}

export default FilterBar;
