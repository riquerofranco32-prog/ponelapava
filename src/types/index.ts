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

// ── Coupon ──────────────────────────────────────────────
// Applied manually by staff when writing up the WhatsApp order — the
// checkout is a WhatsApp message, not an online cart, so there's no
// automatic discount step to wire this into.
export interface Coupon {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  validFrom?: string;
  validUntil?: string;
  active: boolean;
  createdAt: string;
}

export type CouponInput = Omit<Coupon, "id" | "createdAt">;

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

export type DeliveryMethod = "pickup" | "delivery";
export type PaymentMethod = "transfer" | "card" | "cash";

export interface Order {
  id?: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  couponCode?: string;
  shippingCost?: number;
  deliveryMethod?: DeliveryMethod;
  deliveryAddress?: string;
  paymentMethod?: PaymentMethod;
  total: number;
  comment?: string;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  createdAt: string;
}

// ── WhatsApp ────────────────────────────────────────────
export interface WhatsAppOrderData {
  customerName: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal?: number;
  discount?: number;
  couponCode?: string;
  shippingCost?: number;
  deliveryMethod?: DeliveryMethod;
  deliveryAddress?: string;
  paymentMethod?: PaymentMethod;
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
