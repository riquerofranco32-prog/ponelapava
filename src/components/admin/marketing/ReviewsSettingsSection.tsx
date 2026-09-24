"use client";

import { Plus, Trash2, Star } from "lucide-react";
import { LandingContent, LandingReviewItem } from "@/types/landing";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminField } from "@/components/admin/AdminField";
import { AdminButton } from "@/components/admin/AdminButton";

interface ReviewsSettingsSectionProps {
  content: LandingContent;
  onChange: (updated: LandingContent) => void;
}

const DEFAULT_REVIEWS: LandingReviewItem[] = [
  {
    id: "1",
    name: "Cristian Casagrande",
    meta: "4 reseñas · 1 foto",
    time: "Hace 8 meses",
    text: "Productos de calidad, excelente atención.",
    rating: 5,
  },
  {
    id: "2",
    name: "Victoria Ruiz",
    meta: "Local Guide · 197 reseñas",
    time: "Hace 3 meses",
    text: "Sitio impecable, atención esmerada de Pilar; todo lo que se necesita para un buen Mate; excelente!!!",
    rating: 5,
  },
  {
    id: "3",
    name: "Sandro Lacon",
    meta: "Cliente verificado",
    time: "Hace 4 meses",
    text: "Excelente atención y variedad de productos. Súper recomendado en Catriel.",
    rating: 5,
  },
  {
    id: "4",
    name: "Mariana Mauad",
    meta: "Cliente verificado",
    time: "Hace 6 meses",
    text: "Los mejores mates y yerbas de la zona, calidad garantizada.",
    rating: 5,
  },
];

export function ReviewsSettingsSection({
  content,
  onChange,
}: ReviewsSettingsSectionProps) {
  const reviews =
    content.reviews && content.reviews.length > 0 ? content.reviews : DEFAULT_REVIEWS;

  const handleUpdate = (index: number, patch: Partial<LandingReviewItem>) => {
    const next = [...reviews];
    if (next[index]) {
      next[index] = { ...next[index], ...patch };
      onChange({ ...content, reviews: next });
    }
  };

  const handleAdd = () => {
    const newItem: LandingReviewItem = {
      id: `rev_${Date.now()}`,
      name: "Nombre del Cliente",
      meta: "Cliente verificado",
      time: "Reciente",
      text: "Excelente experiencia y productos hermosos.",
      rating: 5,
    };
    onChange({ ...content, reviews: [...reviews, newItem] });
  };

  const handleRemove = (index: number) => {
    const next = reviews.filter((_, i) => i !== index);
    onChange({ ...content, reviews: next });
  };

  return (
    <div className="space-y-6">
      <AdminCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="admin-section-title flex items-center gap-2">
              <Star size={18} className="text-amber-400 fill-amber-400" />
              <span>Reseñas y Testimonios de Clientes</span>
            </h2>
            <p className="text-xs text-[var(--dash-muted)] mt-1">
              Las opiniones destacadas que se muestran en el carrusel de calificaciones de la tienda.
            </p>
          </div>
          <AdminButton variant="primary" size="sm" onClick={handleAdd}>
            <Plus size={14} className="mr-1" />
            Nueva reseña
          </AdminButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reviews.map((rev, idx) => (
            <div
              key={rev.id || idx}
              className="p-4 bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-[var(--dash-border-subtle)] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--dash-accent)]">
                      Reseña #{idx + 1}
                    </span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < rev.rating ? "fill-amber-400" : "opacity-30"}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="text-[var(--dash-muted)] hover:text-[var(--dash-danger)] transition-colors p-1"
                    title="Eliminar reseña"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <AdminField label="Nombre">
                    <input
                      type="text"
                      value={rev.name}
                      onChange={(e) => handleUpdate(idx, { name: e.target.value })}
                      className="admin-input text-xs"
                      placeholder="Nombre del cliente"
                    />
                  </AdminField>

                  <AdminField label="Detalle / Origen">
                    <input
                      type="text"
                      value={rev.meta}
                      onChange={(e) => handleUpdate(idx, { meta: e.target.value })}
                      className="admin-input text-xs"
                      placeholder="Local Guide / Cliente"
                    />
                  </AdminField>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <AdminField label="Fecha / Antigüedad">
                    <input
                      type="text"
                      value={rev.time}
                      onChange={(e) => handleUpdate(idx, { time: e.target.value })}
                      className="admin-input text-xs"
                      placeholder="Hace 2 semanas"
                    />
                  </AdminField>

                  <AdminField label="Estrellas (1 a 5)">
                    <select
                      value={rev.rating}
                      onChange={(e) =>
                        handleUpdate(idx, { rating: parseInt(e.target.value, 10) })
                      }
                      className="admin-input text-xs font-bold text-amber-400"
                    >
                      <option value="5">★★★★★ (5 estrellas)</option>
                      <option value="4">★★★★☆ (4 estrellas)</option>
                      <option value="3">★★★☆☆ (3 estrellas)</option>
                    </select>
                  </AdminField>
                </div>

                <AdminField label="Opinión / Comentario">
                  <textarea
                    rows={2}
                    value={rev.text}
                    onChange={(e) => handleUpdate(idx, { text: e.target.value })}
                    className="admin-input text-xs resize-y"
                    placeholder="El texto que escribió el cliente..."
                  />
                </AdminField>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
