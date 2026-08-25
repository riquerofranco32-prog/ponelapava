import { KpiSkeleton, TableSkeleton } from "@/components/admin/TableSkeleton";

export default function CuponesLoading() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <KpiSkeleton count={3} />
      </div>
      <TableSkeleton rows={4} />
    </div>
  );
}
