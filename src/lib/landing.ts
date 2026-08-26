import { cache } from "react";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { LandingContent } from "@/types/landing";

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  hero: {
    badge: "Poné La Pava · Tienda Matera",
    titleLine1: "El ritual",
    titleLine2: "del mate",
    titleLine3: "es tuyo.",
    subtitle: "Yerbas seleccionadas, mates artesanales y accesorios para acompañar cada ronda.",
    backgroundImage: "/hero_background_1786545961305.png",
    videoUrl: "/videohero.mp4",
    ctaPrimaryText: "Explorar el catálogo",
    ctaPrimaryLink: "/catalogo",
    ctaSecondaryText: "Conocé el local",
    ctaSecondaryLink: "/#el-local",
  },
  announcements: [
    {
      id: "transf",
      highlight: "10% OFF EXTRA",
      text: "abonando con Transferencia Bancaria o Efectivo",
    },
    {
      id: "local",
      highlight: "Retiro GRATIS",
      text: "en nuestro local de Catriel (San Martín 245)",
    },
    {
      id: "envios",
      highlight: "Envíos Seguros",
      text: "a Río Negro, Neuquén y todo el país",
    },
    {
      id: "calidad",
      highlight: "Calidad Artesanal",
      text: "Mates de calabaza seleccionada, alpaca y cuero genuino",
    },
  ],
  promoBanner: {
    active: true,
    badge: "PROMO EXCLUSIVA",
    title: "Armá tu Set Matero con 10% OFF",
    description: "Elegí tu mate, bombilla y yerba favorita y llevátelos con descuento especial en combo.",
    image: "/products/mate-camionero-vaqueta.jpg",
    buttonText: "Armar mi Set Ahora",
    buttonLink: "/#arma-tu-set",
  },
  galleryPosts: [
    {
      id: "1",
      image: "/brand-gallery/post-1.jpg",
      alt: "Mates artesanales y bombillas en Poné La Pava",
    },
    {
      id: "2",
      image: "/brand-gallery/post-3.jpg",
      alt: "Termos y accesorios materos en exhibición",
    },
    {
      id: "3",
      image: "/brand-gallery/post-5.jpg",
      alt: "Yerbas seleccionadas y estacionadas",
    },
    {
      id: "4",
      image: "/brand-gallery/post-7.jpg",
      alt: "Mates camioneros e imperiales de cuero vaqueta",
    },
    {
      id: "5",
      image: "/brand-gallery/post-9.jpg",
      alt: "Sets materos y combos completos",
    },
  ],
};

// In-memory fallback if Supabase table doesn't exist yet
let memoryLandingContent: LandingContent = { ...DEFAULT_LANDING_CONTENT };

export const getLandingContent = cache(async (): Promise<LandingContent> => {
  try {
    const { data, error } = await supabase
      .from("landing_content")
      .select("content")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data || !data.content) {
      return memoryLandingContent;
    }

    return {
      ...DEFAULT_LANDING_CONTENT,
      ...data.content,
      hero: { ...DEFAULT_LANDING_CONTENT.hero, ...(data.content.hero || {}) },
      promoBanner: { ...DEFAULT_LANDING_CONTENT.promoBanner, ...(data.content.promoBanner || {}) },
      announcements: data.content.announcements?.length ? data.content.announcements : DEFAULT_LANDING_CONTENT.announcements,
      galleryPosts: data.content.galleryPosts?.length ? data.content.galleryPosts : DEFAULT_LANDING_CONTENT.galleryPosts,
    };
  } catch {
    return memoryLandingContent;
  }
});

export async function updateLandingContent(
  input: LandingContent,
): Promise<LandingContent> {
  const contentToSave: LandingContent = {
    ...input,
    updatedAt: new Date().toISOString(),
  };

  memoryLandingContent = contentToSave;

  try {
    const { error } = await supabaseAdmin()
      .from("landing_content")
      .upsert({
        id: "default",
        content: contentToSave,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn("Could not persist to landing_content table (using memory cache):", error.message);
    }
  } catch (err) {
    console.warn("Landing content saved in memory fallback:", err);
  }

  return contentToSave;
}
