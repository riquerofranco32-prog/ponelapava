// ── Product ────────────────────────────────────────────
// Category slugs come from the `categories` table (managed in /admin) —
// not a fixed union, so newly created categories don't need a code change.
export type ProductCategory = string;

export type ProductStatus = "available" | "out_of_stock" | "featured";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  price: number;
  category: ProductCategory;
  status: ProductStatus;
  stock: number;
  images: string[];
  tags?: string[];
  weight?: string;
  brand?: string;
  featured?: boolean;
  // Promo vigente — el admin la prende y apaga por producto. El precio de
  // promo es EL precio (no hay regular tachado), así que alcanza con un flag
  // y no hace falta un segundo campo de precio.
  promo?: boolean;
  createdAt?: string;
}

// ── Category ────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: ProductCategory;
  description: string;
  image: string;
  icon: string;
  sortOrder?: number;
  productCount?: number;
}

// ── Cart ────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// ── Order ────────────────────────────────────────────────
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id?: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  comment?: string;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  createdAt: string;
}

// ── WhatsApp ────────────────────────────────────────────
export interface WhatsAppOrderData {
  customerName: string;
  items: CartItem[];
  total: number;
  comment?: string;
}

// ── Admin ────────────────────────────────────────────────
export interface AdminMetric {
  label: string;
  value: number | string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}
