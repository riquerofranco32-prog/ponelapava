"use client";

import CategoriesPanel from "@/components/admin/CategoriesPanel";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { useAdminProducts } from "@/lib/useAdminProducts";

export default function AdminCategoriasPage() {
  const { categories, products, loadError, loadCategories } =
    useAdminProducts();

  return (
    <div>
      {loadError && <AdminErrorBanner message={loadError} />}
      <CategoriesPanel
        categories={categories}
        products={products}
        onChange={loadCategories}
      />
    </div>
  );
}
