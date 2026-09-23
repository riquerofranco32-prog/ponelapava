"use client";

import { Sparkles } from "lucide-react";
import { ProductCategory } from "@/types";

export interface PresetItem {
  icon: string;
  label: string;
  category: ProductCategory;
  name: string;
  description: string;
  longDescription: string;
  tags: string;
  price: string;
  weight: string;
  brand: string;
  stock: string;
}

export const PRESETS: PresetItem[] = [
  {
    icon: "🧉",
    label: "Mate Imperial",
    category: "mates",
    name: "Mate Imperial de Calabaza con Virola Cincelada",
    description: "Mate de calabaza seleccionada forrado en cuero vacuno con virola de alpaca cincelada a mano.",
    longDescription: "Pieza artesanal única fabricada con calabaza gruesa de máxima calidad y durabilidad. Forrado en cuero legítimo con costuras reforzadas y virola de alpaca cincelada con motivos tradicionales.",
    tags: "Calabaza, Cuero Vacuno, Alpaca, Cincelado, Artesanal, Premium",
    price: "45000",
    weight: "350g",
    brand: "Poné La Pava",
    stock: "8",
  },
  {
    icon: "🧉",
    label: "Mate Camionero",
    category: "mates",
    name: "Mate Camionero Cuero y Alpaca",
    description: "Mate camionero de boca ancha forrado en cuero vacuno de primera selección.",
    longDescription: "El clásico de todos los días. Boca ancha ideal para una cebada cómoda y rendidora. Base firme de 4 patas reforzadas.",
    tags: "Calabaza, Cuero Vacuno, Boca Ancha, Artesanal",
    price: "38000",
    weight: "320g",
    brand: "Poné La Pava",
    stock: "10",
  },
  {
    icon: "🥄",
    label: "Bombilla Pico de Loro",
    category: "bombillas",
    name: "Bombilla Pico de Loro de Alpaca Maciza",
    description: "Bombilla curva pico de loro de alpaca maciza con filtro de pala ranurada.",
    longDescription: "Excelente flujo de infusión y filtrado superior. No se tapa ni calienta los labios gracias a su aleación de alpaca premium.",
    tags: "Alpaca, Pico de Loro, Filtro Pala, Premium",
    price: "18500",
    weight: "60g",
    brand: "Poné La Pava",
    stock: "15",
  },
  {
    icon: "🥤",
    label: "Termo de Acero",
    category: "termos",
    name: "Termo de Acero Inoxidable 1L Doble Capa",
    description: "Termo térmico de 1 litro con tecnología de aislamiento al vacío por 24hs.",
    longDescription: "Fabricado en acero inoxidable 18/8 libre de BPA. Mantiene agua caliente por más de 24 horas. Pico matero cebador de precisión antiderrame.",
    tags: "Acero Inox, Térmico, Pico Cebador, 1 Litro",
    price: "55000",
    weight: "800g",
    brand: "Poné La Pava",
    stock: "6",
  },
  {
    icon: "🌿",
    label: "Yerba Despalada",
    category: "yerbas",
    name: "Yerba Mate Despalada Estacionada 500g",
    description: "Yerba mate premium 100% hoja sin palo con estacionamiento natural de 24 meses.",
    longDescription: "Sabor intenso y duradero. Cero acidez gracias a su proceso de maduración prolongada. Rendimiento garantizado para muchas cebadas.",
    tags: "Despalada, Sin Palo, Estacionamiento Natural, Orgánica",
    price: "4200",
    weight: "500g",
    brand: "Selección Especial",
    stock: "20",
  },
  {
    icon: "👜",
    label: "Matera de Cuero",
    category: "accesorios",
    name: "Bolso Matero de Cuero Genuino",
    description: "Bolso matero organizador con divisor térmico acolchado para termo, mate y yerbera.",
    longDescription: "Confeccionado en cuero vacuno rústico de alta resistencia. Correa reforzada ajustable para hombro y manija superior.",
    tags: "Cuero Vacuno, Bolso Matero, Organizador, Viaje",
    price: "48000",
    weight: "650g",
    brand: "Poné La Pava",
    stock: "5",
  },
];

export const QUICK_TAGS = [
  "Calabaza",
  "Cuero Vacuno",
  "Alpaca",
  "Cincelado",
  "Acero Inox",
  "Térmico",
  "Pico de Loro",
  "Estacionamiento Natural",
  "Sin Polvo",
  "Orgánica",
  "Premium",
  "Artesanal",
  "Ideal Regalo",
  "Edición Especial",
];

interface ProductFormPresetsProps {
  onApplyPreset: (preset: PresetItem) => void;
  onToggleTag: (tag: string) => void;
  selectedTags: string[];
}

export function ProductFormPresets({
  onApplyPreset,
  onToggleTag,
  selectedTags,
}: ProductFormPresetsProps) {
  return (
    <div className="space-y-4">
      {/* Quick Templates */}
      <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)]">
          <Sparkles size={13} />
          <span>Plantillas Rápidas (Catálogo Frecuente)</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onApplyPreset(p)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--dash-surface)] hover:bg-[var(--dash-surface-3)] text-[var(--dash-text)] border border-[var(--dash-border)] transition-colors"
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Tags Selector */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-[var(--dash-muted)]">
          Etiquetas Rápidas
        </div>
        <div className="flex flex-wrap gap-1">
          {QUICK_TAGS.map((t) => {
            const isSelected = selectedTags.some(
              (curr) => curr.trim().toLowerCase() === t.toLowerCase()
            );
            return (
              <button
                key={t}
                type="button"
                onClick={() => onToggleTag(t)}
                className={`px-2 py-0.5 rounded-full text-xs transition-colors border ${
                  isSelected
                    ? "bg-[var(--dash-accent-bg)] text-[var(--dash-accent)] border-[var(--dash-accent-border)] font-semibold"
                    : "bg-[var(--dash-surface-2)] text-[var(--dash-muted)] border-[var(--dash-border)] hover:text-[var(--dash-text)]"
                }`}
              >
                {isSelected ? "✓ " : "+ "}
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProductFormPresets;
