"use client";

import { useEffect, useState } from "react";
import { Category, Product } from "@/types";
import { ProductInput } from "@/lib/products";
import { assertOk } from "@/lib/admin-fetch";
import { useAdminToast } from "@/components/admin/AdminToast";

// Shared by /admin/dashboard and /admin/productos — both need the live
// products+categories list and the same CRUD/stock mutations.
export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const showToast = useAdminToast();

  // `silent` skips the loading flag on refetches after a mutation — the
  // table already has data on screen, so flashing it back to a skeleton
  // on every save/delete reads as a glitch rather than a load.
  async function loadProducts(silent = false) {
    if (!silent) setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/products");
      assertOk(res, "No se pudieron cargar los productos");
      setProducts(await res.json());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function loadCategories() {
    const res = await fetch("/api/admin/categories");
    assertOk(res, "No se pudieron cargar las categorías");
    setCategories(await res.json());
  }

  useEffect(() => {
    loadProducts();
    loadCategories().catch((err) =>
      setLoadError(err instanceof Error ? err.message : "Error desconocido"),
    );
  }, []);

  async function handleCreate(input: ProductInput) {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    assertOk(res, "No se pudo crear el producto");
    await loadProducts(true);
    showToast("Producto creado");
  }

  async function handleUpdate(id: string, input: ProductInput) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    assertOk(res, "No se pudo actualizar el producto");
    await loadProducts(true);
  }

  async function handleFormUpdate(id: string, input: ProductInput) {
    await handleUpdate(id, input);
    showToast("Producto actualizado");
  }

  // Mirrors ProductForm's stock/status link: 0 auto-marks out of stock,
  // restocking from 0 auto-clears it back to available.
  //
  // Rethrows on failure — StockStepper awaits this to know when to roll
  // its optimistic count back, so swallowing the error here would leave
  // the count wrong on screen with no toast to explain why.
  async function handleStockChange(product: Product, next: number) {
    const qty = Math.max(0, next);
    let status = product.status;
    if (qty <= 0 && status !== "out_of_stock") status = "out_of_stock";
    else if (qty > 0 && status === "out_of_stock") status = "available";

    const { id, createdAt: _createdAt, ...rest } = product;
    try {
      await handleUpdate(id, { ...rest, stock: qty, status });
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "No se pudo actualizar el stock",
        "error",
      );
      throw err;
    }
  }

  async function handleDelete(product: Product) {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "DELETE",
    });
    assertOk(res, "No se pudo eliminar el producto");
    await loadProducts(true);
    showToast("Producto eliminado");
  }

  return {
    products,
    categories,
    loading,
    loadError,
    loadCategories,
    handleCreate,
    handleUpdate,
    handleFormUpdate,
    handleStockChange,
    handleDelete,
  };
}
