"use client";

import { useState } from "react";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MessageCircle,
  AlertCircle,
  Calendar,
  Store,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/types";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { whatsappChatUrl } from "@/lib/whatsapp";

const STATUS_STEPS = [
  { id: "pending", label: "Pedido Recibido", icon: Clock, desc: "Recibimos tu solicitud y estamos coordinando el pago." },
  { id: "confirmed", label: "En Preparación", icon: Package, desc: "Pago acreditado. Estamos seleccionando y embalando tus productos." },
  { id: "shipped", label: "En Camino / Listo", icon: Truck, desc: "Despachado con número de guía o listo para retirar en Catriel." },
  { id: "delivered", label: "Entregado", icon: CheckCircle2, desc: "¡Pedido completado! Que disfrutes de cada mate." },
];

export default function TrackingPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const settings = useSiteSettings();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setLoading(true);
    setError(null);
    setOrders(null);

    try {
      const res = await fetch(`/api/orders/tracking?q=${encodeURIComponent(cleanQuery)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo consultar el pedido");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar el pedido");
    } finally {
      setLoading(false);
    }
  };

  const getActiveStepIndex = (status: Order["status"], comment?: string) => {
    if (status === "cancelled") return -1;
    if (status === "delivered") return 3;
    if (status === "confirmed") {
      // Check if ready or dispatched in comment
      if (comment?.toLowerCase().includes("despachado") || comment?.toLowerCase().includes("guía") || comment?.toLowerCase().includes("listo")) {
        return 2;
      }
      return 1;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-pava-cream">
      <PageHeader
        eyebrow="Portal de Clientes"
        title="Seguimiento de Pedidos"
        description="Consultá en tiempo real el estado de preparación y envío de tu compra matera."
      />

      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-10 lg:py-16">
        {/* Search Card */}
        <div className="rounded-3xl border border-pava-brown/12 bg-white p-6 sm:p-8 shadow-sm backdrop-blur-sm">
          <h2 className="font-display text-lg sm:text-xl font-bold text-pava-brown mb-2">
            Ingresá tus datos de pedido
          </h2>
          <p className="text-xs sm:text-sm text-pava-brown-mid/75 mb-6">
            Podés buscar por tu <strong>Número de Pedido</strong> (ej: <code>#ORD-...</code> o código UUID) o por el <strong>Número de Teléfono</strong> ingresado al comprar.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-pava-brown/40"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej: #a1b2c3d4 o 2991234567"
                required
                className="w-full rounded-2xl border border-pava-brown/20 bg-pava-cream/30 pl-11 pr-4 py-3.5 text-sm text-pava-brown placeholder:text-pava-brown/40 focus:border-pava-green focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-pava-green px-8 py-3.5 text-sm font-bold text-pava-cream hover:bg-pava-green-light transition-all disabled:opacity-50 shadow-md active:scale-[0.98]"
            >
              {loading ? (
                <span className="animate-spin text-base">⏳</span>
              ) : (
                <Search size={16} />
              )}
              <span>{loading ? "Buscando..." : "Consultar Estado"}</span>
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {orders !== null && (
          <div className="mt-8 space-y-8">
            {orders.length === 0 ? (
              <div className="rounded-3xl border border-pava-brown/10 bg-white/80 p-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pava-brown/5 text-pava-brown/30 mx-auto mb-4">
                  <Package size={32} />
                </span>
                <h3 className="font-display text-lg font-bold text-pava-brown">
                  No encontramos ningún pedido con esos datos
                </h3>
                <p className="text-xs sm:text-sm text-pava-brown-mid/70 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
                  Verificá haber escrito correctamente el número de pedido o teléfono. Si hiciste tu pedido recién por WhatsApp, puede demorar unos minutos en procesarse.
                </p>
                <a
                  href={whatsappChatUrl(
                    settings.whatsappNumber,
                    `Hola! Quiero consultar por el estado de mi compra: ${query}`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-control bg-whatsapp px-6 py-3 text-xs font-bold text-white hover:bg-whatsapp-dark transition-colors"
                >
                  <MessageCircle size={15} />
                  <span>Consultar por WhatsApp a Poné La Pava</span>
                </a>
              </div>
            ) : (
              orders.map((order) => {
                const activeIndex = getActiveStepIndex(order.status, order.comment);
                const isCancelled = order.status === "cancelled";
                const isDelivery = order.comment?.includes("[Envío a Domicilio");
                const isPickup = order.comment?.includes("[Retiro en Local");

                return (
                  <div
                    key={order.id}
                    className="rounded-3xl border border-pava-brown/12 bg-white overflow-hidden shadow-sm"
                  >
                    {/* Order Header */}
                    <div className="border-b border-pava-brown/10 bg-pava-cream/50 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-base font-bold text-pava-brown">
                            Pedido #{order.id?.slice(0, 8).toUpperCase()}
                          </span>
                          {isCancelled ? (
                            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-800">
                              Cancelado
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                              <Sparkles size={11} /> Activo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-pava-brown-mid/70 mt-0.5 flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>Realizado el {new Date(order.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase tracking-wider text-pava-brown-mid/70 block">
                          Total abonado
                        </span>
                        <span className="font-display text-lg font-bold text-pava-green">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="p-6 sm:p-8">
                      <h4 className="font-display text-sm font-bold text-pava-brown uppercase tracking-wider mb-6">
                        Progreso del Envío
                      </h4>

                      {isCancelled ? (
                        <div className="rounded-2xl bg-red-50 p-4 border border-red-200 text-xs text-red-800">
                          Este pedido fue cancelado. Por favor escribinos por WhatsApp si tenés alguna duda sobre el reintegro.
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Timeline Line */}
                          <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-pava-brown/10 z-0">
                            <div
                              className="h-full bg-pava-green transition-all duration-700"
                              style={{
                                width: `${(activeIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                              }}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-3 relative z-10">
                            {STATUS_STEPS.map((step, idx) => {
                              const Icon = step.icon;
                              const isPassed = idx <= activeIndex;
                              const isCurrent = idx === activeIndex;

                              return (
                                <div
                                  key={step.id}
                                  className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3.5 sm:gap-2"
                                >
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                                      isCurrent
                                        ? "border-pava-green bg-pava-green text-white shadow-lg shadow-pava-green/30 scale-110"
                                        : isPassed
                                          ? "border-pava-green bg-pava-green/20 text-pava-green"
                                          : "border-pava-brown/20 bg-white text-pava-brown/40"
                                    }`}
                                  >
                                    <Icon size={18} />
                                  </div>

                                  <div>
                                    <span
                                      className={`block text-xs font-bold ${
                                        isPassed ? "text-pava-brown" : "text-pava-brown/40"
                                      }`}
                                    >
                                      {step.label}
                                    </span>
                                    <p className="text-[11px] text-pava-brown-mid/70 leading-relaxed mt-0.5">
                                      {step.desc}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Delivery & Items details */}
                      <div className="mt-8 pt-6 border-t border-pava-brown/10 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Items list */}
                        <div>
                          <h5 className="font-display text-xs font-bold text-pava-brown uppercase tracking-wider mb-3">
                            Productos del Pedido
                          </h5>
                          <ul className="space-y-2 text-xs">
                            {order.items.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-center justify-between py-1.5 border-b border-pava-brown/5 text-pava-brown"
                              >
                                <span className="font-medium">
                                  {item.quantity}x {item.productName}
                                </span>
                                <span className="font-bold text-pava-green">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Shipping info & WhatsApp */}
                        <div className="flex flex-col justify-between rounded-2xl bg-pava-cream/40 p-4 border border-pava-brown/10">
                          <div>
                            <h5 className="font-display text-xs font-bold text-pava-brown uppercase tracking-wider mb-2">
                              Modalidad de Entrega
                            </h5>
                            <div className="text-xs text-pava-brown space-y-1.5">
                              {isDelivery && (
                                <p className="flex items-center gap-1.5 text-pava-green font-semibold">
                                  <Truck size={14} /> Envío a Domicilio (Correo / Andreani)
                                </p>
                              )}
                              {isPickup && (
                                <p className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                                  <Store size={14} /> Retiro en Local Catriel (San Martín 374)
                                </p>
                              )}
                              {order.comment && (
                                <p className="text-[11px] text-pava-brown-mid/70 italic mt-2">
                                  {order.comment}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-pava-brown/10">
                            <a
                              href={whatsappChatUrl(
                                settings.whatsappNumber,
                                `Hola! Quiero consultar por mi pedido #${order.id?.slice(0, 8).toUpperCase()}`,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 w-full rounded-control bg-whatsapp py-2.5 px-4 text-xs font-bold text-white hover:bg-whatsapp-dark transition-colors"
                            >
                              <MessageCircle size={14} />
                              <span>Consultar por este pedido</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Guarantees bar */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="rounded-2xl border border-pava-brown/10 bg-white/60 p-4">
            <ShieldCheck size={20} className="text-pava-green mx-auto mb-2" />
            <h4 className="font-display text-xs font-bold text-pava-brown">Garantía Poné La Pava</h4>
            <p className="text-[11px] text-pava-brown-mid/70 mt-0.5">Calidad artesanal y soporte directo</p>
          </div>
          <div className="rounded-2xl border border-pava-brown/10 bg-white/60 p-4">
            <Truck size={20} className="text-pava-green mx-auto mb-2" />
            <h4 className="font-display text-xs font-bold text-pava-brown">Envíos Cuidados</h4>
            <p className="text-[11px] text-pava-brown-mid/70 mt-0.5">Embalaje reforzado anti-golpes</p>
          </div>
          <div className="rounded-2xl border border-pava-brown/10 bg-white/60 p-4">
            <MessageCircle size={20} className="text-pava-green mx-auto mb-2" />
            <h4 className="font-display text-xs font-bold text-pava-brown">Atención Personalizada</h4>
            <p className="text-[11px] text-pava-brown-mid/70 mt-0.5">Te asesoramos paso a paso por WhatsApp</p>
          </div>
        </div>
      </div>
    </div>
  );
}
