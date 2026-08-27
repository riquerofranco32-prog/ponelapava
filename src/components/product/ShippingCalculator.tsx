"use client";

import { useState } from "react";
import { Truck, MapPin, Check, Calculator, Clock, Store } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ShippingCalculatorProps {
  productPrice: number;
}

const REGION_RATES: Record<string, { standard: number; express: number; days: string }> = {
  "rio-negro": { standard: 3200, express: 4500, days: "1 a 3 días hábiles" },
  neuquen: { standard: 3200, express: 4500, days: "1 a 3 días hábiles" },
  "buenos-aires": { standard: 3800, express: 5200, days: "2 a 4 días hábiles" },
  cordoba: { standard: 3900, express: 5400, days: "2 a 4 días hábiles" },
  "santa-fe": { standard: 3900, express: 5400, days: "2 a 4 días hábiles" },
  mendoza: { standard: 3600, express: 4900, days: "2 a 3 días hábiles" },
  cuyo: { standard: 3800, express: 5200, days: "3 a 5 días hábiles" },
  patagonia: { standard: 3500, express: 4800, days: "2 a 4 días hábiles" },
  norte: { standard: 4400, express: 5900, days: "3 a 6 días hábiles" },
  default: { standard: 3900, express: 5500, days: "3 a 5 días hábiles" },
};

export default function ShippingCalculator({ productPrice }: ShippingCalculatorProps) {
  const [zipCode, setZipCode] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [calculated, setCalculated] = useState(false);
  const [loading, setLoading] = useState(false);

  const FREE_SHIPPING_THRESHOLD = 65000;
  const isFree = productPrice >= FREE_SHIPPING_THRESHOLD;

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode && !selectedProvince) return;
    setLoading(true);
    setTimeout(() => {
      setCalculated(true);
      setLoading(false);
    }, 300);
  };

  const getRates = () => {
    const cp = parseInt(zipCode.trim(), 10);
    if (!isNaN(cp)) {
      if (cp >= 8300 && cp <= 8332) return REGION_RATES["neuquen"];
      if (cp >= 8305 && cp <= 8500) return REGION_RATES["rio-negro"];
      if (cp >= 1000 && cp <= 1999) return REGION_RATES["buenos-aires"];
      if (cp >= 5000 && cp <= 5999) return REGION_RATES["cordoba"];
      if (cp >= 2000 && cp <= 3000) return REGION_RATES["santa-fe"];
      if (cp >= 5500 && cp <= 5600) return REGION_RATES["mendoza"];
    }

    if (selectedProvince) {
      return REGION_RATES[selectedProvince] || REGION_RATES.default;
    }

    return REGION_RATES.default;
  };

  const rates = getRates();

  return (
    <div className="rounded-card border border-pava-brown/12 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Truck size={16} className="text-pava-green" />
        <span className="font-display text-xs font-bold text-pava-brown uppercase tracking-wider">
          Calcular costo de envío
        </span>
      </div>

      <form onSubmit={handleCalculate} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <MapPin
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-pava-brown/40"
          />
          <input
            type="text"
            value={zipCode}
            onChange={(e) => {
              setZipCode(e.target.value);
              if (calculated) setCalculated(false);
            }}
            placeholder="Ingresá tu Código Postal (ej: 8307)"
            maxLength={8}
            className="w-full rounded-control border border-pava-brown/20 bg-pava-cream/30 pl-8.5 pr-3 py-2 text-xs text-pava-brown placeholder:text-pava-brown/40 focus:border-pava-green focus:bg-white focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || (!zipCode.trim() && !selectedProvince)}
          className="flex items-center justify-center gap-1.5 rounded-control bg-pava-brown px-4 py-2 text-xs font-semibold text-pava-cream hover:bg-pava-green transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="animate-spin text-xs">⏳</span>
          ) : (
            <Calculator size={13} />
          )}
          <span>Calcular</span>
        </button>
      </form>

      {/* Direct region selector fallback */}
      {!calculated && (
        <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-pava-brown-mid/70">
          <span>O seleccioná tu provincia:</span>
          <select
            value={selectedProvince}
            onChange={(e) => {
              setSelectedProvince(e.target.value);
              if (e.target.value) {
                setCalculated(true);
              }
            }}
            aria-label="Seleccionar provincia para calcular envío"
            className="rounded border border-pava-brown/15 bg-transparent px-2 py-1 text-[11px] text-pava-brown focus:outline-none"
          >
            <option value="">Seleccionar...</option>
            <option value="rio-negro">Río Negro</option>
            <option value="neuquen">Neuquén</option>
            <option value="buenos-aires">Buenos Aires / CABA</option>
            <option value="cordoba">Córdoba</option>
            <option value="santa-fe">Santa Fe</option>
            <option value="mendoza">Mendoza</option>
            <option value="patagonia">Resto Patagonia</option>
            <option value="norte">Norte Argentino</option>
          </select>
        </div>
      )}

      {/* Results */}
      {calculated && (
        <div className="mt-3.5 space-y-2 border-t border-pava-brown/10 pt-3">
          {/* Andreani / Correo Standard */}
          <div className="flex items-center justify-between gap-2 rounded-lg bg-pava-cream/50 p-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Truck size={15} className="text-pava-green shrink-0" />
              <div>
                <span className="font-semibold text-pava-brown block">
                  Envío Estándar (Correo Argentino / Andreani)
                </span>
                <span className="text-[10px] text-pava-brown-mid/70 flex items-center gap-1">
                  <Clock size={10} /> Llega en {rates.days}
                </span>
              </div>
            </div>
            <div className="text-right">
              {isFree ? (
                <span className="font-bold text-pava-green flex items-center gap-1 text-xs">
                  <Check size={12} strokeWidth={3} /> GRATIS
                </span>
              ) : (
                <span className="font-bold text-pava-brown">
                  {formatPrice(rates.standard)}
                </span>
              )}
            </div>
          </div>

          {/* Retiro local */}
          <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60 p-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Store size={15} className="text-emerald-700 shrink-0" />
              <div>
                <span className="font-semibold text-emerald-900 block">
                  Retiro Gratis en Local Catriel
                </span>
                <span className="text-[10px] text-emerald-700/80">
                  Av. San Martín 374 • Listo hoy mismo
                </span>
              </div>
            </div>
            <span className="font-bold text-emerald-700">¡GRATIS!</span>
          </div>

          {!isFree && (
            <p className="text-[10px] text-pava-brown-mid/75 text-center pt-1">
              Agregá <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - productPrice)}</strong> más para obtener <strong>Envío Gratis</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
