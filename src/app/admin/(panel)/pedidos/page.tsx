"use client";

import { Suspense } from "react";
import OrdersTable from "@/components/admin/OrdersTable";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

export default function AdminPedidosPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <OrdersTable />
    </Suspense>
  );
}
