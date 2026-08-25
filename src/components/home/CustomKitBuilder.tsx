"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Check, ShoppingCart, MessageCircle, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { formatPrice } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { useCart } from "@/context/CartContext";

const MATES = [
  {
    id: "mate-camionero",
    name: "Mate Camionero Vaqueta",
    price: 7200,
    image: "/products/mate-camionero-vaqueta.jpg",
    tag: "Cuero grueso",
  },
  {
    id: "mate-calabaza",
    name: "Mate Calabaza Cuero Natural",
    price: 5500,
    image: "/product_mate_calabaza_1786546121145.png",
    tag: "Clásico de autor",
  },
  {
    id: "mate-imperial",
    name: "Mate Imperial Palo Santo",
    price: 6800,
    image: "/product_mate_calabaza_1786546121145.png",
    tag: "Virola cincelada",
  },
];

const BOMBILLAS = [
  {
    id: "bombilla-pico-loro",
    name: "Bombilla Pico de Loro Alpaca",
    price: 2600,
    tag: "Filtro ranurado",
  },
  {
    id: "bombilla-alpaca",
    name: "Bombilla Alpaca Lisa 18cm",
    price: 1800,
    tag: "Punta oval",
  },
  {
    id: "bombilla-resorte",
    name: "Bombilla Acero Resorte",
    price: 1400,
    tag: "Fácil limpieza",
  },
];

const YERBAS = [
  {
    id: "yerba-canarias",
    name: "Yerba Canarias 1kg",
    price: 6800,
    image: "/products/yerba-canarias-1kg.jpg",
    tag: "Tipo Uruguaya",
  },
  {
    id: "yerba-playadito",
    name: "Yerba Playadito 1kg",
    price: 4900,
    image: "/products/yerba-playadito-1kg.jpg",
    tag: "Suave correntina",
  },
  {
    id: "yerba-sara",
    name: "Yerba Sara Extra Suave 1kg",
    price: 6400,
    image: "/products/yerba-sara-1kg.jpg",
    tag: "Equilibrada",
  },
];

export default function CustomKitBuilder() {
  const [selectedMate, setSelectedMate] = useState(MATES[0]);
  const [selectedBombilla, setSelectedBombilla] = useState(BOMBILLAS[0]);
  const [selectedYerba, setSelectedYerba] = useState(YERBAS[0]);

  const { addItem, setDrawer } = useCart();

  const subtotal = selectedMate.price + selectedBombilla.price + selectedYerba.price;
  const discount = Math.round(subtotal * 0.1);
  const total = subtotal - discount;

  const whatsappMessage = `¡Hola Poné La Pava! Quiero pedir el Set Matero Personalizado con 10% OFF:\n- ${selectedMate.name}\n- ${selectedBombilla.name}\n- ${selectedYerba.name}\nTotal con descuento: ${formatPrice(total)}`;

  function handleAddToCart() {
    // Add custom combo product
    addItem({
      id: `combo-${selectedMate.id}-${selectedBombilla.id}-${selectedYerba.id}`,
      name: `Set Matero Personalizado (${selectedMate.name.split(" ")[1]} + ${selectedBombilla.name.split(" ")[1]} + ${selectedYerba.name.split(" ")[1]})`,
      slug: "set-matero-personalizado",
      description: "Set personalizado con mate, bombilla y yerba elegidos con 10% OFF.",
      price: total,
      category: "combos",
      status: "available",
      images: [selectedMate.image || "/product_combo_kit_1786546132809.png"],
      tags: ["combo", "personalizado", "descuento"],
      stock: 10,
      featured: true,
      createdAt: new Date().toISOString(),
    });
    setDrawer(true);
  }

  return (
    <section id="arma-tu-set" className="relative overflow-hidden bg-pava-green-dark py-24 sm:py-28 lg:py-36 text-pava-cream border-b border-pava-cream/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <ScrollReveal direction="up" className="mb-14 max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-9 bg-pava-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold">
              Experiencia interactiva
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-cream sm:text-5xl lg:text-6xl">
            Armá tu set matero,
            <br />
            <em className="not-italic text-pava-gold">llevate 10% de descuento.</em>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-pava-cream/75 max-w-lg">
            Elegí tu mate, bombilla y yerba favorita para crear tu combinación ideal a un precio especial.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
          {/* Options Column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Mate */}
            <ScrollReveal direction="up" delay={50}>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pava-gold text-pava-brown text-xs font-bold">1</span>
                <h3 className="font-display text-lg font-bold text-pava-cream">Elegí tu Mate</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MATES.map((m) => {
                  const isSelected = m.id === selectedMate.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMate(m)}
                      className={`flex flex-col justify-between p-4 rounded-control border-2 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-pava-gold bg-pava-cream/10 shadow-md shadow-pava-gold/10"
                          : "border-pava-cream/15 bg-pava-green/40 hover:border-pava-cream/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-pava-gold uppercase tracking-wider">{m.tag}</span>
                        {isSelected && <Check size={14} className="text-pava-gold" />}
                      </div>
                      <span className="font-semibold text-xs text-pava-cream mb-1">{m.name}</span>
                      <span className="text-xs font-bold text-pava-gold">{formatPrice(m.price)}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollReveal>

            {/* Step 2: Bombilla */}
            <ScrollReveal direction="up" delay={100}>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pava-gold text-pava-brown text-xs font-bold">2</span>
                <h3 className="font-display text-lg font-bold text-pava-cream">Elegí tu Bombilla</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BOMBILLAS.map((b) => {
                  const isSelected = b.id === selectedBombilla.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBombilla(b)}
                      className={`flex flex-col justify-between p-4 rounded-control border-2 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-pava-gold bg-pava-cream/10 shadow-md shadow-pava-gold/10"
                          : "border-pava-cream/15 bg-pava-green/40 hover:border-pava-cream/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-pava-gold uppercase tracking-wider">{b.tag}</span>
                        {isSelected && <Check size={14} className="text-pava-gold" />}
                      </div>
                      <span className="font-semibold text-xs text-pava-cream mb-1">{b.name}</span>
                      <span className="text-xs font-bold text-pava-gold">{formatPrice(b.price)}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollReveal>

            {/* Step 3: Yerba */}
            <ScrollReveal direction="up" delay={150}>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pava-gold text-pava-brown text-xs font-bold">3</span>
                <h3 className="font-display text-lg font-bold text-pava-cream">Elegí tu Yerba</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {YERBAS.map((y) => {
                  const isSelected = y.id === selectedYerba.id;
                  return (
                    <button
                      key={y.id}
                      type="button"
                      onClick={() => setSelectedYerba(y)}
                      className={`flex flex-col justify-between p-4 rounded-control border-2 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-pava-gold bg-pava-cream/10 shadow-md shadow-pava-gold/10"
                          : "border-pava-cream/15 bg-pava-green/40 hover:border-pava-cream/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-pava-gold uppercase tracking-wider">{y.tag}</span>
                        {isSelected && <Check size={14} className="text-pava-gold" />}
                      </div>
                      <span className="font-semibold text-xs text-pava-cream mb-1">{y.name}</span>
                      <span className="text-xs font-bold text-pava-gold">{formatPrice(y.price)}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>

          {/* Summary Column */}
          <ScrollReveal direction="right" delay={100} className="lg:col-span-5 sticky top-28">
            <div className="relative rounded-card border border-pava-gold/30 bg-pava-green/80 p-7 sm:p-8 backdrop-blur-md shadow-2xl overflow-hidden">
              <BorderBeam
                size={240}
                duration={12}
                borderWidth={1.5}
                colorFrom="#c7a67a"
                colorTo="transparent"
              />

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-pava-cream/15">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-pava-gold block">
                    Resumen de tu Set
                  </span>
                  <h4 className="font-display text-xl font-bold text-pava-cream mt-0.5">
                    Combo Personalizado
                  </h4>
                </div>
                <span className="rounded-chip bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                  10% OFF
                </span>
              </div>

              {/* Items breakdown */}
              <div className="space-y-3 mb-6 text-xs text-pava-cream/80">
                <div className="flex items-center justify-between py-1.5 border-b border-pava-cream/5">
                  <span className="truncate pr-2">🧉 {selectedMate.name}</span>
                  <span className="font-semibold text-pava-cream">{formatPrice(selectedMate.price)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-pava-cream/5">
                  <span className="truncate pr-2">✨ {selectedBombilla.name}</span>
                  <span className="font-semibold text-pava-cream">{formatPrice(selectedBombilla.price)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-pava-cream/5">
                  <span className="truncate pr-2">🌿 {selectedYerba.name}</span>
                  <span className="font-semibold text-pava-cream">{formatPrice(selectedYerba.price)}</span>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="space-y-1.5 mb-6 pt-2 border-t border-pava-cream/15">
                <div className="flex items-center justify-between text-xs text-pava-cream/60">
                  <span>Precio regular:</span>
                  <span className="line-through">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                  <span>Descuento Set Matero (10%):</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
                <div className="flex items-baseline justify-between pt-3 border-t border-pava-cream/15">
                  <span className="text-sm font-bold text-pava-cream">Total Combo:</span>
                  <span className="font-display text-3xl font-extrabold text-pava-gold">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 rounded-control bg-pava-gold py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-pava-brown shadow-lg shadow-pava-gold/20 transition-all hover:bg-pava-gold-light active:scale-[0.98] cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  Agregar Set al Carrito
                </button>

                <a
                  href={`https://wa.me/5492994119330?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-control border border-pava-cream/20 bg-pava-cream/5 py-3 text-xs font-semibold text-pava-cream transition-all hover:border-whatsapp hover:bg-whatsapp/15 hover:text-whatsapp"
                >
                  <MessageCircle size={15} />
                  Pedir este Set por WhatsApp
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
