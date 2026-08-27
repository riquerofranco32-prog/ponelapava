"use client";

import { useState } from "react";
import { Sparkles, Check, Type } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface LaserEngravingPreviewProps {
  onEngravingChange?: (enabled: boolean, text: string, font: string) => void;
}

const FONTS = [
  { id: "serif", name: "Clásica Imperial", style: "font-serif tracking-widest uppercase font-bold" },
  { id: "sans", name: "Moderna Minimal", style: "font-sans tracking-[0.25em] uppercase font-black" },
  { id: "cursive", name: "Cursiva Elegante", style: "italic tracking-wider font-semibold font-serif" },
];

export default function LaserEngravingPreview({ onEngravingChange }: LaserEngravingPreviewProps) {
  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState("");
  const [selectedFont, setSelectedFont] = useState(FONTS[0].id);

  const ENGRAVING_PRICE = 3500;

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    onEngravingChange?.(checked, text, selectedFont);
  };

  const handleTextChange = (newText: string) => {
    const sanitized = newText.slice(0, 22);
    setText(sanitized);
    onEngravingChange?.(enabled, sanitized, selectedFont);
  };

  const handleFontChange = (fontId: string) => {
    setSelectedFont(fontId);
    onEngravingChange?.(enabled, text, fontId);
  };

  const activeFontObj = FONTS.find((f) => f.id === selectedFont) || FONTS[0];

  return (
    <div className="rounded-card border border-pava-brown/15 bg-white p-4.5 shadow-sm transition-all">
      {/* Switch Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pava-gold/20 text-pava-brown text-xs">
            <Sparkles size={13} className="text-pava-brown" />
          </span>
          <div>
            <span className="font-display text-xs font-bold text-pava-brown uppercase tracking-wider block">
              Personalizado con Grabado Láser
            </span>
            <span className="text-[11px] text-pava-brown-mid/70">
              Grabamos tu nombre, iniciales o escudo en la virola
            </span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-pava-brown/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pava-green" />
        </label>
      </div>

      {enabled && (
        <div className="mt-4 pt-4 border-t border-pava-brown/10 space-y-3.5 animate-fade-in">
          {/* Price badge */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-pava-brown-mid/80 font-medium">Costo de personalización:</span>
            <span className="font-display font-bold text-pava-green">+{formatPrice(ENGRAVING_PRICE)}</span>
          </div>

          {/* Text Input */}
          <div>
            <label className="text-[11px] font-semibold text-pava-brown block mb-1">
              Texto a grabar (máx. 22 letras):
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Ej: FRANCO • LP • 2026"
              maxLength={22}
              className="w-full rounded-control border border-pava-brown/20 bg-pava-cream/30 px-3 py-2 text-xs text-pava-brown placeholder:text-pava-brown/40 focus:border-pava-green focus:bg-white focus:outline-none"
            />
          </div>

          {/* Font selector */}
          <div>
            <label className="text-[11px] font-semibold text-pava-brown block mb-1.5 flex items-center gap-1">
              <Type size={12} /> Estilo de tipografía:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => handleFontChange(font.id)}
                  className={`px-2 py-1.5 rounded-lg border text-[10px] font-medium transition-all text-center ${
                    selectedFont === font.id
                      ? "border-pava-green bg-pava-green text-white font-bold"
                      : "border-pava-brown/15 bg-pava-cream/40 text-pava-brown hover:bg-pava-cream"
                  }`}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>

          {/* Realistic Virola Engraving Visualizer */}
          <div className="mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-pava-brown-mid/70 block mb-1.5">
              Previsualización sobre la virola metálica:
            </span>
            <div className="relative h-14 w-full rounded-xl overflow-hidden border border-slate-400/50 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 shadow-inner flex items-center justify-center px-4">
              {/* Metallic shine reflection */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-black/15 pointer-events-none" />

              {/* Engraved Carved Text */}
              <span
                className={`relative text-slate-800 text-sm sm:text-base drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] transition-all select-none ${activeFontObj.style}`}
                style={{
                  textShadow: "1px 1px 0px rgba(255,255,255,0.9), -1px -1px 0px rgba(0,0,0,0.3)",
                }}
              >
                {text.trim() || "TU TEXTO ACÁ"}
              </span>
            </div>
            <p className="text-[10px] text-pava-brown-mid/60 text-center mt-1 flex items-center justify-center gap-1">
              <Check size={10} className="text-pava-green" /> Grabado indeleble de alta precisión por láser fibra óptica
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
