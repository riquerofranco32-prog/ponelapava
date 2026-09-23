import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  skeletonRows?: number;
  emptyState?: React.ReactNode;
  density?: "comfortable" | "compact";
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  pagination?: {
    page: number;
    totalPages: number;
    totalItems?: number;
    onPageChange: (newPage: number) => void;
  };
  renderMobileCard?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  skeletonRows = 5,
  emptyState,
  density = "comfortable",
  selectable = false,
  selectedIds = [],
  onSelect,
  onSelectAll,
  sortColumn,
  sortDirection,
  onSort,
  pagination,
  renderMobileCard,
  className = "",
}: DataTableProps<T>) {
  if (loading) {
    return <TableSkeleton rows={skeletonRows} />;
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const allSelected =
    selectable && data.length > 0 && data.every((item) => selectedIds.includes(keyExtractor(item)));
  const someSelected =
    selectable && data.some((item) => selectedIds.includes(keyExtractor(item))) && !allSelected;

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      {/* Desktop & Tablet Table */}
      <div className={`${renderMobileCard ? "hidden md:block " : ""}admin-datatable-wrapper`}>
        <table className={`admin-datatable ${density === "compact" ? "admin-datatable--compact" : ""}`}>
          <thead>
            <tr>
              {selectable && (
                <th className="w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={onSelectAll}
                    aria-label="Seleccionar todos"
                    className="rounded border-[var(--dash-border)] bg-[var(--dash-surface-2)] text-[var(--dash-accent)] focus:ring-[var(--dash-accent)] cursor-pointer"
                  />
                </th>
              )}

              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                return (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={`${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"} ${col.sortable ? "cursor-pointer select-none group" : ""}`}
                    onClick={() => col.sortable && onSort?.(col.key)}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : "justify-start"}`}>
                      <span>{col.label}</span>
                      {col.sortable && (
                        <span className="text-[var(--dash-muted)] group-hover:text-[var(--dash-accent)]">
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="w-3.5 h-3.5 text-[var(--dash-accent)]" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-[var(--dash-accent)]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds.includes(id);

              return (
                <tr
                  key={id}
                  className={`admin-row-hover ${isSelected ? "bg-[var(--dash-surface-3)]" : ""}`}
                >
                  {selectable && (
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect?.(id)}
                        aria-label={`Seleccionar fila ${id}`}
                        className="rounded border-[var(--dash-border)] bg-[var(--dash-surface-2)] text-[var(--dash-accent)] focus:ring-[var(--dash-accent)] cursor-pointer"
                      />
                    </td>
                  )}

                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left"
                      }
                    >
                      {col.render
                        ? col.render(item, idx)
                        : (item as Record<string, unknown>)[col.key] != null
                        ? String((item as Record<string, unknown>)[col.key])
                        : "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Fallback */}
      {renderMobileCard && (
        <div className="md:hidden space-y-3">
          {data.map((item, idx) => (
            <div key={keyExtractor(item)}>
              {renderMobileCard(item, idx)}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-2 text-xs text-[var(--dash-muted)]">
          <div>
            {pagination.totalItems !== undefined ? (
              <span>Total: <strong className="text-[var(--dash-text)]">{pagination.totalItems}</strong> registros</span>
            ) : (
              <span>Página <strong className="text-[var(--dash-text)]">{pagination.page}</strong> de <strong className="text-[var(--dash-text)]">{pagination.totalPages}</strong></span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="admin-icon-btn disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-medium text-[var(--dash-text)]">
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="admin-icon-btn disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
