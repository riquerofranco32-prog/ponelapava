// Input validation for everything that crosses an API boundary. Deliberately
// free of any Next.js import so it can be exercised straight from
// scripts/pricing-check.mjs with bare `node` — the HTTP wrapper lives in
// api-guard.ts.

export class ValidationError extends Error {}

function requireText(value: unknown, field: string, max = 200): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new ValidationError(`${field} es obligatorio`);
  if (text.length > max) {
    throw new ValidationError(`${field} no puede superar ${max} caracteres`);
  }
  return text;
}

function optionalText(value: unknown, field: string, max: number): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length > max) {
    throw new ValidationError(`${field} no puede superar ${max} caracteres`);
  }
  return text;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function requireSlug(value: unknown, fallback: string): string {
  const slug =
    typeof value === "string" && value.trim() ? value.trim() : fallback;
  if (!SLUG_PATTERN.test(slug)) {
    throw new ValidationError(
      "El slug sólo admite minúsculas, números y guiones (ej: mate-imperial)",
    );
  }
  return slug;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const PRODUCT_STATUSES = ["available", "out_of_stock", "featured"] as const;
const MAX_PRICE = 100_000_000;
const MAX_STOCK = 100_000;

export interface ValidatedProduct {
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  price: number;
  category: string;
  status: (typeof PRODUCT_STATUSES)[number];
  stock: number;
  images: string[];
  tags: string[];
  weight?: string;
  brand?: string;
  featured: boolean;
}

// The admin form validates too, but the form is not the boundary — anything
// that can PUT /api/admin/products/:id lands here first.
export function validateProduct(input: unknown): ValidatedProduct {
  const raw = (input ?? {}) as Record<string, unknown>;

  const name = requireText(raw.name, "El nombre", 200);
  const price = Number(raw.price);
  if (!Number.isFinite(price) || price <= 0 || price > MAX_PRICE) {
    throw new ValidationError("El precio debe ser un número mayor a 0");
  }
  const stock = Number(raw.stock ?? 0);
  if (!Number.isInteger(stock) || stock < 0 || stock > MAX_STOCK) {
    throw new ValidationError("El stock debe ser un entero de 0 o más");
  }
  const status = PRODUCT_STATUSES.includes(raw.status as never)
    ? (raw.status as ValidatedProduct["status"])
    : "available";
  const images = Array.isArray(raw.images)
    ? raw.images.filter((i): i is string => typeof i === "string" && !!i.trim())
    : [];
  if (images.length === 0) {
    throw new ValidationError("Agregá al menos una foto del producto");
  }

  return {
    name,
    slug: requireSlug(raw.slug, slugify(name)),
    description: optionalText(raw.description, "La descripción", 1000),
    longDescription:
      optionalText(raw.longDescription, "La descripción larga", 5000) ||
      undefined,
    price,
    category: requireText(raw.category, "La categoría", 100),
    status,
    stock,
    images,
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((t): t is string => typeof t === "string").slice(0, 30)
      : [],
    weight: optionalText(raw.weight, "El peso", 50) || undefined,
    brand: optionalText(raw.brand, "La marca", 100) || undefined,
    featured: Boolean(raw.featured),
  };
}

export interface ValidatedCategory {
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  sortOrder: number;
}

export function validateCategory(input: unknown): ValidatedCategory {
  const raw = (input ?? {}) as Record<string, unknown>;
  const name = requireText(raw.name, "El nombre", 100);
  const sortOrder = Number(raw.sortOrder ?? 0);

  return {
    name,
    slug: requireSlug(raw.slug, slugify(name)),
    description: optionalText(raw.description, "La descripción", 500),
    image: optionalText(raw.image, "La imagen", 500),
    icon: optionalText(raw.icon, "El ícono", 20),
    sortOrder: Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0,
  };
}

export interface ValidatedCoupon {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  validFrom?: string;
  validUntil?: string;
  active: boolean;
}

const COUPON_CODE_PATTERN = /^[A-Z0-9_-]{3,30}$/;

function optionalDate(value: unknown, field: string): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  if (Number.isNaN(Date.parse(value))) {
    throw new ValidationError(`${field} no es una fecha válida`);
  }
  return value;
}

export function validateCoupon(input: unknown): ValidatedCoupon {
  const raw = (input ?? {}) as Record<string, unknown>;
  const code = String(raw.code ?? "").trim().toUpperCase();
  if (!COUPON_CODE_PATTERN.test(code)) {
    throw new ValidationError(
      "El código debe tener entre 3 y 30 caracteres (letras, números, - o _)",
    );
  }
  if (raw.discountType !== "percent" && raw.discountType !== "fixed") {
    throw new ValidationError("Tipo de descuento inválido");
  }
  const discountValue = Number(raw.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    throw new ValidationError("El descuento debe ser mayor a 0");
  }
  if (raw.discountType === "percent" && discountValue > 100) {
    throw new ValidationError("Un descuento porcentual no puede superar 100%");
  }

  const validFrom = optionalDate(raw.validFrom, "La fecha de inicio");
  const validUntil = optionalDate(raw.validUntil, "La fecha de fin");
  if (validFrom && validUntil && Date.parse(validFrom) > Date.parse(validUntil)) {
    throw new ValidationError("La fecha de inicio no puede ser posterior a la de fin");
  }

  return {
    code,
    discountType: raw.discountType,
    discountValue,
    validFrom,
    validUntil,
    active: raw.active !== false,
  };
}
