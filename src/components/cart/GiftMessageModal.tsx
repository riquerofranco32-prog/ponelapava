"use client";

import { useState, useEffect } from "react";
import { Gift, X, Check, Edit3 } from "lucide-react";

export interface GiftMessageData {
  enabled: boolean;
  from: string;
  to: string;
  message: string;
}

interface GiftMessageModalProps {
  onSave?: (data: GiftMessageData) => void;
}

export default function GiftMessageModal({ onSave }: GiftMessageModalProps) {
  const [enabled, setEnabled] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pava_gift_message");
    if (saved) {
      try {
        const parsed: GiftMessageData = JSON.parse(saved);
        setEnabled(parsed.enabled);
        setFrom(parsed.from || "");
        setTo(parsed.to || "");
        setMessage(parsed.message || "");
        onSave?.(parsed);
      } catch {
        // ignore
      }
    }
  }, [onSave]);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    if (checked && !from && !to && !message) {
      setIsOpen(true);
    }
    const data: GiftMessageData = { enabled: checked, from, to, message };
    localStorage.setItem("pava_gift_message", JSON.stringify(data));
    onSave?.(data);
  };

  const handleSaveModal = () => {
    const data: GiftMessageData = { enabled: true, from, to, message };
    setEnabled(true);
    localStorage.setItem("pava_gift_message", JSON.stringify(data));
    onSave?.(data);
    setIsOpen(false);
  };

  return (
    <div className="rounded-2xl border border-pava-gold/30 bg-pava-gold/10 p-4 transition-all">
      {/* Main Switch Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pava-gold text-pava-brown shadow-xs">
            <Gift size={16} />
          </span>
          <div>
            <span className="font-display text-xs font-bold text-pava-brown uppercase tracking-wider block">
              ¿Es para regalo? (Sin cargo)
            </span>
            <span className="text-[11px] text-pava-brown-mid/80">
              Incluimos tarjeta con dedicatoria impresa en papel kraft
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {enabled && (
            <button
              onClick={() => setIsOpen(true)}
              className="text-xs font-semibold text-pava-green hover:underline flex items-center gap-1"
            >
              <Edit3 size={12} />
              <span>Editar</span>
            </button>
          )}
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
      </div>

      {/* Mini Active Summary */}
      {enabled && message && !isOpen && (
        <div className="mt-3 pt-3 border-t border-pava-brown/10 flex items-center justify-between text-xs text-pava-brown">
          <span className="italic truncate max-w-xs text-[11px] text-pava-brown-mid/90">
            &ldquo;{message}&rdquo; {to ? `— Para: ${to}` : ""}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 shrink-0 ml-2">
            <Check size={12} /> Tarjeta lista
          </span>
        </div>
      )}

      {/* Editor Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-pava-brown/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-3xl border border-pava-brown/15 bg-pava-cream p-6 sm:p-8 shadow-2xl animate-scale-in">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-pava-brown/50 hover:bg-pava-brown/10 hover:text-pava-brown transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-pava-gold mb-1">
              <Gift size={18} />
              <span className="text-xs font-bold uppercase tracking-wider text-pava-brown">
                Tarjeta de Regalo Poné La Pava
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-pava-brown">
              Escribí tu Dedicatoria Especial
            </h3>
            <p className="text-xs text-pava-brown-mid/70 mt-0.5 mb-5">
              Imprimiremos tu mensaje en una tarjeta artesanal que acompañará la caja de regalo.
            </p>

            <div className="space-y-3.5 mb-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-pava-brown block mb-1">
                    Para (Nombre del homenajeado):
                  </label>
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Ej: Sofi, Papá, Marcos"
                    className="w-full rounded-control border border-pava-brown/20 bg-white px-3 py-2 text-xs text-pava-brown placeholder:text-pava-brown/40 focus:border-pava-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-pava-brown block mb-1">
                    De parte de:
                  </label>
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Ej: Franco, Familia Riquero"
                    className="w-full rounded-control border border-pava-brown/20 bg-white px-3 py-2 text-xs text-pava-brown placeholder:text-pava-brown/40 focus:border-pava-green focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-pava-brown block mb-1">
                  Mensaje o dedicatoria:
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                  rows={3}
                  placeholder="Ej: ¡Muy feliz cumpleaños! Que este mate te acompañe en cada linda charla y proyecto nuevo."
                  className="w-full rounded-control border border-pava-brown/20 bg-white px-3 py-2 text-xs text-pava-brown placeholder:text-pava-brown/40 focus:border-pava-green focus:outline-none resize-none"
                />
                <div className="text-right text-[10px] text-pava-brown-mid/60">
                  {message.length}/200 caracteres
                </div>
              </div>
            </div>

            {/* Realistic Kraft Card Live Preview */}
            <div className="relative rounded-2xl border-2 border-amber-800/20 bg-[#f4ebd9] p-5 shadow-inner mb-6 text-center">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-amber-900/60 mb-2">
                <span>Poné La Pava • Catriel</span>
                <span>⚜️ Regalo Especial</span>
              </div>
              <p className="font-serif italic text-base text-amber-950 font-medium py-2 leading-relaxed">
                {message.trim() ? `"${message}"` : '"Tu mensaje de dedicatoria aparecerá aquí..."'}
              </p>
              <div className="flex items-center justify-between text-xs font-serif text-amber-900/80 pt-2 border-t border-amber-900/10 mt-2">
                <span>{to ? `Para: ${to}` : "Para: [Nombre]"}</span>
                <span>{from ? `De: ${from}` : "De: [Tu Nombre]"}</span>
              </div>
            </div>

            <button
              onClick={handleSaveModal}
              className="w-full flex items-center justify-center gap-2 rounded-control bg-pava-green py-3 text-xs font-bold text-pava-cream hover:bg-pava-green-light transition-colors shadow-md"
            >
              <Check size={15} />
              <span>Guardar Tarjeta de Regalo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
