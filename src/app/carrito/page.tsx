"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  MessageCircle,
  ChevronLeft,
  AlertTriangle,
  Truck,
  Store,
  Tag,
  Check,
  Loader2,
  X,
  CreditCard,
  Banknote,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { isStoreOpenNow, getNextOpeningLabel } from "@/lib/hours";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import PageHeader from "@/components/layout/PageHeader";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import GiftMessageModal from "@/components/cart/GiftMessageModal";
import type { Product, ProductStatus } from "@/types";

export default function CartPage() {
  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    total,
    itemCount,
    syncCart,
  } = useCart();
  const settings = useSiteSettings();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [comment, setComment] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "cash" | "card">("transfer");
  
  // Upsell state
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [isSyncing, setIsSyncing] = useState(true);
  const [syncNotices, setSyncNotices] = useState<string[]>([]);
  // Starts null (matches server HTML, avoids a hydration mismatch, same
  // pattern as OpenStatusBadge) — resolves on mount since it depends on the
  // visitor's clock.
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  useEffect(() => {
    setIsOpen(isStoreOpenNow(settings.hoursWeekday, settings.hoursSaturday));
  }, [settings.hoursWeekday, settings.hoursSaturday]);

  // Load complementary products for upsell
  useEffect(() => {
    fetch("/api/products/search?q=")
      .then((res) => res.json())
      .then((data: Product[]) => {
        if (Array.isArray(data)) {
          // pick items not currently in cart
          const cartIds = new Set(items.map((i) => i.product.id));
          const available = data.filter((p) => !cartIds.has(p.id) && p.status !== "out_of_stock");
          setSuggestedProducts(available.slice(0, 4));
        }
      })
      .catch(() => {});
  }, [items]);

  // Shipping & discount calculations
  const FREE_SHIPPING_THRESHOLD = 65000;
  const standardShippingCost = 3500;
  const isFreeShipping = total >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = deliveryMethod === "delivery" ? (isFreeShipping ? 0 : standardShippingCost) : 0;

  // Coupon discount
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percent") {
      couponDiscount = Math.round((total * appliedCoupon.discountValue) / 100);
    } else {
      couponDiscount = Math.min(total, appliedCoupon.discountValue);
    }
  }

  // Payment method discount (10% OFF for Transfer or Cash in store)
  const baseForPaymentDiscount = Math.max(0, total - couponDiscount);
  const paymentDiscount =
    paymentMethod === "transfer" || paymentMethod === "cash"
      ? Math.round(baseForPaymentDiscount * 0.1)
      : 0;

  const totalDiscount = couponDiscount + paymentDiscount;
  const finalTotal = Math.max(0, total - totalDiscount + shippingCost);

  // Re-check price/stock/status against the DB on load — the cart snapshot
  // in localStorage can be days old. Runs once against the items present
  // at mount; skip entirely if the cart was already empty.
  const didSyncRef = useRef(false);
  useEffect(() => {
    if (didSyncRef.current || items.length === 0) {
      setIsSyncing(false);
      return;
    }
    didSyncRef.current = true;
    const before = items;
    fetch("/api/products/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: before.map(({ product }) => product.id) }),
    })
      .then((res) => res.json())
      .then(
        (data: {
          products?: {
            id: string;
            price: number;
            stock: number;
            status: ProductStatus;
          }[];
        }) => {
          const fresh = data.products ?? [];
          const freshMap = new Map(fresh.map((p) => [p.id, p]));
          const notices: string[] = [];
          const removed = before.filter(
            ({ product }) => !freshMap.has(product.id),
          );
          if (removed.length === 1) {
            notices.push(
              `${removed[0].product.name} ya no está disponible y la quitamos del carrito.`,
            );
          } else if (removed.length > 1) {
            notices.push(
              `${removed.length} productos ya no están disponibles y los quitamos del carrito.`,
            );
          }

          const priceChanged = before.filter(({ product }) => {
            const p = freshMap.get(product.id);
            return p && p.price !== product.price;
          });
          if (priceChanged.length === 1) {
            notices.push(`${priceChanged[0].product.name} cambió de precio.`);
          } else if (priceChanged.length > 1) {
            notices.push(
              `${priceChanged.length} productos cambiaron de precio.`,
            );
          }

          const newlyOutOfStock = before.filter(({ product }) => {
            const p = freshMap.get(product.id);
            return (
              p &&
              p.status === "out_of_stock" &&
              product.status !== "out_of_stock"
            );
          });
          newlyOutOfStock.forEach(({ product }) =>
            notices.push(`${product.name} se agotó.`),
          );

          setSyncNotices(notices);
          syncCart(fresh);
        },
      )
      .catch(() => {
        // Validate endpoint failed — skip the stale-data notice, but don't
        // block checkout on it forever.
      })
      .finally(() => setIsSyncing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data.coupon);
        setCouponCode("");
      } else {
        setCouponError(data.error || "Cupón no válido");
      }
    } catch {
      setCouponError("Error al validar el cupón");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const handleWhatsApp = () => {
    if (items.length === 0) return;

    const fullAddress =
      deliveryMethod === "delivery"
        ? `${deliveryAddress.trim()}${deliveryNotes.trim() ? ` (${deliveryNotes.trim()})` : ""}`
        : undefined;

    let fullComment = comment.trim();
    try {
      const giftSaved = localStorage.getItem("pava_gift_message");
      if (giftSaved) {
        const gift = JSON.parse(giftSaved);
        if (gift.enabled && gift.message) {
          const giftText = `[🎁 TARJETA REGALO - Para: ${gift.to || "Especial"} | De: ${gift.from || "Un amigo"} | Mensaje: "${gift.message}"]`;
          fullComment = fullComment ? `${fullComment} ${giftText}` : giftText;
        }
      }
    } catch {}

    const orderData = {
      customerName: customerName || "Sin nombre",
      customerPhone: customerPhone.trim() || undefined,
      items,
      subtotal: total,
      discount: totalDiscount > 0 ? totalDiscount : undefined,
      couponCode: appliedCoupon?.code,
      shippingCost: shippingCost > 0 ? shippingCost : undefined,
      deliveryMethod,
      deliveryAddress: fullAddress,
      paymentMethod,
      total: finalTotal,
      comment: fullComment || undefined,
    };

    // Open WhatsApp synchronously
    const url = buildWhatsAppUrl(settings.whatsappNumber, orderData);
    window.open(url, "_blank", "noopener,noreferrer");

    // Best-effort order log in backend
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    }).catch(() => {});
  };

  if (items.length === 0) {
    return (
      <div className="bg-pava-cream min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4 py-20">
          <ShoppingBag size={48} className="mx-auto text-pava-brown/20 mb-6" />
          <h1 className="font-display text-3xl font-bold text-pava-brown mb-3">
            Tu carrito está vacío
          </h1>
          {syncNotices.length > 0 && (
            <div className="flex gap-2 text-left rounded-control bg-amber-50 border border-amber-300 text-amber-800 text-xs p-3 mb-6">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                {syncNotices.map((notice) => (
                  <p key={notice}>{notice}</p>
                ))}
              </div>
            </div>
          )}
          <p className="text-pava-brown-mid/70 mb-8">
            Explorá nuestro catálogo y encontrá lo que estás buscando.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-control px-8 py-4 bg-pava-green text-pava-cream text-sm font-semibold border-2 border-pava-green hover:bg-pava-green-light transition-colors"
          >
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-pava-cream min-h-screen">
      <PageHeader
        eyebrow="Tu selección"
        title="Carrito"
        description={`${itemCount} producto${itemCount !== 1 ? "s" : ""} en tu carrito`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Items list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-pava-brown">
                Productos
              </h2>
              <button
                onClick={clearCart}
                className="text-xs text-pava-brown/40 hover:text-pava-terracotta transition-colors underline underline-offset-2"
              >
                Vaciar carrito
              </button>
            </div>

            <ul className="space-y-4">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-4 p-4 rounded-card bg-white border border-pava-brown/8"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-control">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/producto/${product.id}`}
                      className="text-sm font-medium text-pava-brown hover:text-pava-green transition-colors leading-tight line-clamp-2 block"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-pava-brown/50 mt-0.5 mb-3">
                      {formatPrice(product.price)} c/u
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center overflow-hidden rounded-control border border-pava-brown/15">
                        <button
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                          className="flex items-center justify-center h-11 w-11 sm:h-8 sm:w-8 text-pava-brown hover:text-pava-green hover:bg-pava-cream-dark transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-pava-brown">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                          className="flex items-center justify-center h-11 w-11 sm:h-8 sm:w-8 text-pava-brown hover:text-pava-green hover:bg-pava-cream-dark transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-display font-bold text-pava-green">
                          {formatPrice(product.price * quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="tap-44 text-pava-brown/30 hover:text-pava-terracotta transition-colors"
                          aria-label={`Eliminar ${product.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Upsell recommendation */}
            {suggestedProducts.length > 0 && (
              <div className="mt-8 rounded-card bg-pava-cream-dark/50 border border-pava-brown/10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-pava-gold-deep" />
                  <h3 className="font-display text-base font-bold text-pava-brown">
                    Completá tu ronda matera
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-control bg-white border border-pava-brown/10 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-12 h-12 shrink-0 rounded-chip overflow-hidden bg-pava-cream">
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-pava-brown truncate">{p.name}</p>
                          <p className="text-xs font-bold text-pava-green">{formatPrice(p.price)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addItem(p, 1)}
                        className="shrink-0 px-2.5 py-1.5 rounded-chip bg-pava-green/10 text-pava-green hover:bg-pava-green hover:text-pava-cream text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Sumar</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 mt-8 text-sm text-pava-brown/50 hover:text-pava-green transition-colors"
            >
              <ChevronLeft size={15} />
              Seguir eligiendo productos
            </Link>
          </div>

          {/* Summary & checkout */}
          <div className="lg:col-span-1">
            {syncNotices.length > 0 && (
              <div className="flex gap-2 rounded-control bg-amber-50 border border-amber-300 text-amber-800 text-xs p-3 mb-4">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  {syncNotices.map((notice) => (
                    <p key={notice}>{notice}</p>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-card bg-white border border-pava-brown/8 p-6 sticky top-24">
              {/* Free shipping progress */}
              {(() => {
                const qualifies = total >= FREE_SHIPPING_THRESHOLD;
                const amountLeft = FREE_SHIPPING_THRESHOLD - total;
                const progressPct = Math.min(100, Math.max(0, (total / FREE_SHIPPING_THRESHOLD) * 100));

                return (
                  <div className="mb-6 rounded-control bg-pava-cream-dark/50 border border-pava-brown/10 p-3.5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      {qualifies ? (
                        <span className="font-semibold text-pava-green flex items-center gap-1.5">
                          <span>🎉</span> ¡Envío gratis incluido!
                        </span>
                      ) : (
                        <span className="text-pava-brown">
                          Faltan <strong className="font-bold text-pava-green">{formatPrice(amountLeft)}</strong> para <strong className="font-semibold">Envío Gratis</strong>
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-pava-brown-mid/75">{Math.round(progressPct)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-pava-brown/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pava-green rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              <h2 className="font-display text-xl font-bold text-pava-brown mb-5">
                Resumen del pedido
              </h2>

              {/* Delivery method selector */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-pava-brown/80 mb-2">
                  1. Método de entrega
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      deliveryMethod === "pickup"
                        ? "border-pava-green bg-pava-green/8 shadow-sm"
                        : "border-pava-brown/15 hover:border-pava-brown/30 bg-pava-cream/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-pava-brown mb-1">
                      <Store size={14} className={deliveryMethod === "pickup" ? "text-pava-green" : "text-pava-brown/60"} />
                      <span>Retiro Local</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium">Gratis (Catriel)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("delivery")}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      deliveryMethod === "delivery"
                        ? "border-pava-green bg-pava-green/8 shadow-sm"
                        : "border-pava-brown/15 hover:border-pava-brown/30 bg-pava-cream/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-pava-brown mb-1">
                      <Truck size={14} className={deliveryMethod === "delivery" ? "text-pava-green" : "text-pava-brown/60"} />
                      <span>A Domicilio</span>
                    </div>
                    <span className="text-[11px] text-pava-brown/60 font-medium">
                      {isFreeShipping ? <span className="text-emerald-700 font-semibold">Gratis</span> : formatPrice(standardShippingCost)}
                    </span>
                  </button>
                </div>

                {/* Delivery Address fields */}
                {deliveryMethod === "delivery" && (
                  <div className="mt-3 space-y-2 p-3 rounded-xl bg-pava-cream-dark/60 border border-pava-brown/10 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-pava-brown/70 mb-1">
                        Dirección de Entrega *
                      </label>
                      <input
                        type="text"
                        placeholder="Calle y altura (ej: Av. San Martín 450)"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full rounded-control px-2.5 py-1.5 bg-white border border-pava-brown/15 text-pava-brown text-xs placeholder-pava-brown/40 focus:outline-none focus:border-pava-green"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Piso / Dpto / Barrio / Entre calles (opcional)"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        className="w-full rounded-control px-2.5 py-1.5 bg-white border border-pava-brown/15 text-pava-brown text-xs placeholder-pava-brown/40 focus:outline-none focus:border-pava-green"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment method selector */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-pava-brown/80 mb-2">
                  2. Forma de pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transfer")}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === "transfer"
                        ? "border-emerald-600 bg-emerald-50 shadow-sm ring-1 ring-emerald-600"
                        : "border-pava-brown/15 hover:border-pava-brown/30 bg-pava-cream/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-pava-brown mb-1">
                      <Banknote size={14} className={paymentMethod === "transfer" ? "text-emerald-700" : "text-pava-brown/60"} />
                      <span>Transferencia</span>
                    </div>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">10% OFF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod(deliveryMethod === "pickup" ? "cash" : "card")}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === "card" || paymentMethod === "cash"
                        ? "border-pava-green bg-pava-green/8 shadow-sm"
                        : "border-pava-brown/15 hover:border-pava-brown/30 bg-pava-cream/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-pava-brown mb-1">
                      <CreditCard size={14} className={paymentMethod === "card" || paymentMethod === "cash" ? "text-pava-green" : "text-pava-brown/60"} />
                      <span>{deliveryMethod === "pickup" ? "Efectivo Local" : "Tarjeta"}</span>
                    </div>
                    <span className="text-[11px] text-pava-brown/60 font-medium">
                      {deliveryMethod === "pickup" ? "10% OFF en local" : "Hasta 6 cuotas"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Coupon Code Section */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-pava-brown/80 mb-1.5">
                  ¿Tenés un cupón de descuento?
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Tag size={13} className="text-emerald-600" />
                      <span className="font-bold tracking-wider">{appliedCoupon.code}</span>
                      <span className="text-[11px] bg-emerald-200/80 px-1.5 py-0.5 rounded text-emerald-900 font-semibold">
                        {appliedCoupon.discountType === "percent"
                          ? `-${appliedCoupon.discountValue}%`
                          : `-${formatPrice(appliedCoupon.discountValue)}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 text-emerald-700 hover:text-emerald-900 transition-colors"
                      title="Quitar cupón"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código de cupón"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      className="flex-1 rounded-control px-3 py-2 bg-pava-cream border border-pava-brown/15 text-pava-brown text-xs uppercase placeholder-pava-brown/40 focus:outline-none focus:border-pava-green"
                    />
                    <button
                      type="submit"
                      disabled={!couponCode.trim() || validatingCoupon}
                      className="px-3.5 py-2 rounded-control bg-pava-brown text-pava-cream hover:bg-pava-green text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {validatingCoupon ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Aplicar"
                      )}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{couponError}</p>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 mb-4 pb-4 border-b border-pava-brown/10 text-xs">
                <div className="flex justify-between text-pava-brown-mid/80">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? "ítem" : "ítems"})</span>
                  <span className="font-semibold text-pava-brown">{formatPrice(total)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag size={12} /> Cupón ({appliedCoupon?.code})
                    </span>
                    <span className="font-bold">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                {paymentDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span className="flex items-center gap-1">
                      <Banknote size={12} /> 10% OFF {paymentMethod === "transfer" ? "Transferencia" : "Efectivo"}
                    </span>
                    <span className="font-bold">-{formatPrice(paymentDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-pava-brown-mid/80">
                  <span>Envío ({deliveryMethod === "pickup" ? "Retiro en local" : "A domicilio"})</span>
                  <span className="font-semibold text-pava-brown">
                    {deliveryMethod === "pickup" || isFreeShipping ? (
                      <span className="text-emerald-700">Gratis</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-pava-brown font-semibold text-sm">Total final</span>
                <span className="font-display text-2xl font-bold text-pava-green">
                  {formatPrice(finalTotal)}
                </span>
              </div>

              {/* Customer form */}
              <div className="space-y-3 mb-6">
                <div>
                  <label
                    htmlFor="customer-name"
                    className="block text-xs font-medium text-pava-brown/70 mb-1"
                  >
                    Tu nombre *
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    placeholder="¿Cómo te llamás?"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-control px-3 py-2.5 bg-pava-cream border border-pava-brown/15 text-pava-brown text-sm placeholder-pava-brown/40 focus:outline-none focus:border-pava-green transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="customer-phone"
                    className="block text-xs font-medium text-pava-brown/70 mb-1"
                  >
                    Teléfono / WhatsApp (opcional)
                  </label>
                  <input
                    id="customer-phone"
                    type="tel"
                    placeholder="Ej: 299 123-4567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-control px-3 py-2.5 bg-pava-cream border border-pava-brown/15 text-pava-brown text-sm placeholder-pava-brown/40 focus:outline-none focus:border-pava-green transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="order-comment"
                    className="block text-xs font-medium text-pava-brown/70 mb-1"
                  >
                    Comentario o detalle (opcional)
                  </label>
                  <textarea
                    id="order-comment"
                    placeholder="¿Alguna aclaración sobre tu pedido o personalización?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                    className="w-full rounded-control px-3 py-2.5 bg-pava-cream border border-pava-brown/15 text-pava-brown text-sm placeholder-pava-brown/40 focus:outline-none focus:border-pava-green transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Gift Message Option */}
              <div className="mb-6">
                <GiftMessageModal />
              </div>

              {/* WhatsApp CTA */}
              <button
                onClick={handleWhatsApp}
                disabled={
                  !customerName.trim() ||
                  isSyncing ||
                  (deliveryMethod === "delivery" && !deliveryAddress.trim())
                }
                className="flex items-center justify-center gap-2 w-full rounded-control py-4 bg-whatsapp text-white text-sm font-semibold border-2 border-whatsapp hover:bg-whatsapp-dark hover:border-whatsapp-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <MessageCircle size={18} />
                {isSyncing
                  ? "Verificando disponibilidad..."
                  : "Enviar pedido por WhatsApp"}
              </button>
              {!isSyncing && !customerName.trim() && (
                <p className="text-xs text-pava-brown/50 text-center mt-2">
                  Completá tu nombre para continuar
                </p>
              )}
              {!isSyncing && deliveryMethod === "delivery" && !deliveryAddress.trim() && customerName.trim() && (
                <p className="text-xs text-amber-800 text-center mt-2 font-medium">
                  Completá la dirección de entrega
                </p>
              )}

              <p className="text-xs text-pava-brown/40 text-center mt-4 leading-relaxed">
                {isOpen === false
                  ? `Estamos cerrados — te respondemos ${getNextOpeningLabel(settings.hoursWeekday, settings.hoursSaturday)}.`
                  : "Se abrirá WhatsApp con tu pedido pre-armado y los datos de entrega para coordinar el pago."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
