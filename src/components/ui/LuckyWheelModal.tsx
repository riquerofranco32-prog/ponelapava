"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Gift, Check, ArrowRight, RotateCw, Copy } from "lucide-react";
import Link from "next/link";

interface WheelSlice {
  label: string;
  code: string;
  color: string;
  textColor: string;
  description: string;
}

const SLICES: WheelSlice[] = [
  { label: "10% OFF EXTRA", code: "RULETA10", color: "#1b3123", textColor: "#f7efe6", description: "10% de descuento en tu pedido" },
  { label: "5% OFF DIRECTO", code: "MATERO5", color: "#d39e4a", textColor: "#2a2018", description: "5% de descuento sin mínimo" },
  { label: "ENVÍO GRATIS", code: "ENVIOGRATIS", color: "#365c43", textColor: "#ffffff", description: "Envío sin cargo a todo el país" },
  { label: "15% EN COMBOS", code: "COMBOMATERO", color: "#a85d3b", textColor: "#ffffff", description: "15% de descuento en sets y combos" },
  { label: "BOMBILLA DE REGALO", code: "BOMBILLA", color: "#1b3123", textColor: "#f7efe6", description: "Bombilla gratis con tu compra" },
  { label: "10% OFF EXTRA", code: "RULETA10", color: "#d39e4a", textColor: "#2a2018", description: "10% de descuento en tu pedido" },
];

export default function LuckyWheelModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningSlice, setWinningSlice] = useState<WheelSlice | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [showTrigger, setShowTrigger] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Check if user already won a prize in this session
    const savedPrize = localStorage.getItem("pava_lucky_prize");
    if (savedPrize) {
      try {
        setWinningSlice(JSON.parse(savedPrize));
        setHasSpun(true);
      } catch {
        // ignore
      }
    }

    // Show floating trigger after 3 seconds
    const timer = setTimeout(() => {
      setShowTrigger(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const spinWheel = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    setWinningSlice(null);

    // Pick random winning index (0 to 5)
    const winningIndex = Math.floor(Math.random() * SLICES.length);
    const sliceAngle = 360 / SLICES.length;
    
    // Calculate target rotation (at least 5 full rotations + slice angle offset)
    const extraTurns = 5 * 360;
    // Align the winning slice with the top pointer (at 270deg or 90deg offset)
    const targetAngle = extraTurns + (SLICES.length - winningIndex) * sliceAngle - sliceAngle / 2;

    setRotation(targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      const prize = SLICES[winningIndex];
      setWinningSlice(prize);
      localStorage.setItem("pava_lucky_prize", JSON.stringify(prize));
      localStorage.setItem("pava_auto_coupon", prize.code);
    }, 4500);
  };

  const handleCopyCode = () => {
    if (!winningSlice) return;
    navigator.clipboard.writeText(winningSlice.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating Gift Trigger Badge */}
      {showTrigger && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-full border-2 border-pava-gold bg-pava-green px-4 py-2.5 text-xs font-bold text-pava-cream shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-pava-green-light active:scale-95 animate-bounce-gentle group"
          aria-label="Girar Ruleta Matera"
        >
          <Gift size={16} className="text-pava-gold animate-wiggle" />
          <span className="font-display tracking-wide">
            {hasSpun ? "Ver mi Cupón 🎁" : "¡Girá y Ganá Descuentos! 🎡"}
          </span>
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-pava-brown/80 backdrop-blur-md transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-pava-brown/15 bg-pava-cream p-6 sm:p-8 shadow-2xl text-center">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-pava-brown/50 hover:bg-pava-brown/10 hover:text-pava-brown transition-colors"
              aria-label="Cerrar ruleta"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-pava-gold/20 px-3 py-1 text-[11px] font-bold text-pava-brown uppercase tracking-wider mb-2">
              <Sparkles size={12} className="text-pava-gold" />
              <span>Ruleta Matera</span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-bold text-pava-brown">
              ¡Girá la Ruleta y Llevate un Premio!
            </h3>
            <p className="text-xs text-pava-brown-mid/75 mt-1 mb-6">
              Todos los giros tienen premio garantizado para tu próxima compra en Poné La Pava.
            </p>

            {/* SVG Wheel */}
            <div className="relative mx-auto my-2 h-64 w-64 sm:h-72 sm:w-72">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-600 drop-shadow-md" />

              {/* Wheel Graphic */}
              <svg
                ref={wheelRef}
                viewBox="0 0 200 200"
                className="h-full w-full rounded-full shadow-xl border-4 border-pava-gold/60"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning
                    ? "transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1)"
                    : "none",
                }}
              >
                {SLICES.map((slice, i) => {
                  const angle = 360 / SLICES.length;
                  const startAngle = i * angle;
                  const endAngle = (i + 1) * angle;
                  const x1 = 100 + 100 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 100 + 100 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 100 + 100 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 100 + 100 * Math.sin((Math.PI * endAngle) / 180);
                  const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;

                  // Text position
                  const midAngle = (startAngle + endAngle) / 2;
                  const textRad = 68;
                  const tx = 100 + textRad * Math.cos((Math.PI * midAngle) / 180);
                  const ty = 100 + textRad * Math.sin((Math.PI * midAngle) / 180);

                  return (
                    <g key={i}>
                      <path d={pathData} fill={slice.color} stroke="#f7efe6" strokeWidth="1" />
                      <text
                        x={tx}
                        y={ty}
                        fill={slice.textColor}
                        fontSize="7"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                      >
                        {slice.label}
                      </text>
                    </g>
                  );
                })}
                {/* Center Hub */}
                <circle cx="100" cy="100" r="18" fill="#f7efe6" stroke="#d39e4a" strokeWidth="3" />
                <text
                  x="100"
                  y="103"
                  fontSize="12"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  🧉
                </text>
              </svg>
            </div>

            {/* Prize Result or Spin Button */}
            {winningSlice ? (
              <div className="mt-6 rounded-2xl border border-pava-green/30 bg-emerald-50 p-4 text-center animate-scale-in">
                <span className="text-xl">🎉</span>
                <h4 className="font-display text-base font-bold text-emerald-950 mt-1">
                  ¡Felicitaciones! Ganaste {winningSlice.label}
                </h4>
                <p className="text-xs text-emerald-800/80 mt-0.5 mb-3">
                  {winningSlice.description}
                </p>

                {/* Coupon Box */}
                <div className="flex items-center justify-center gap-2 rounded-xl bg-white border border-emerald-300 p-2.5 shadow-inner">
                  <span className="font-mono text-sm font-bold tracking-widest text-pava-green">
                    {winningSlice.code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 rounded-lg bg-pava-green px-3 py-1 text-xs font-bold text-pava-cream hover:bg-pava-green-light transition-colors"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copied ? "¡Copiado!" : "Copiar"}</span>
                  </button>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href="/catalogo"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-control bg-pava-green py-2.5 text-xs font-bold text-pava-cream hover:bg-pava-green-light transition-colors"
                  >
                    <span>Usar en el Catálogo</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <button
                  onClick={spinWheel}
                  disabled={isSpinning || hasSpun}
                  className={`w-full flex items-center justify-center gap-2 rounded-control py-3.5 px-6 text-sm font-bold tracking-wide transition-all shadow-lg active:scale-98 ${
                    isSpinning
                      ? "bg-pava-brown/50 text-white cursor-not-allowed"
                      : "bg-pava-green text-pava-cream hover:bg-pava-green-light cursor-pointer shadow-pava-green/20"
                  }`}
                >
                  <RotateCw size={16} className={isSpinning ? "animate-spin" : ""} />
                  <span>{isSpinning ? "Girando la ruleta..." : "¡GIRAR AHORA!"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
