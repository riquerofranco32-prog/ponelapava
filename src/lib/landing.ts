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
      id: "pagos",
      highlight: "Transferencia bancaria",
      text: "y efectivo al retirar en el local",
    },
    {
      id: "local",
      highlight: "Retiro GRATIS",
      text: "en nuestro local de Catriel",
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
    badge: "ARMÁ EL TUYO",
    title: "Armá tu Set Matero pieza por pieza",
    description: "Elegí tu mate, bombilla y yerba favorita y pedí el set completo en un solo mensaje.",
    image: "/products/mate-camionero-vaqueta.jpg",
    buttonText: "Armar mi Set Ahora",
    buttonLink: "/#arma-tu-set",
  },
  about: {
    eyebrow: "Nosotros",
    title: "Más que una yerba.",
    titleHighlight: "Una forma de compartir.",
    quote: "El mate no se toma solo. Y tampoco se elige solo.",
    paragraph1: "En Poné La Pava creemos que el mate no es solo una bebida: es un ritual, un pretexto para estar juntos, para bajar el ritmo y conectar.",
    paragraph2: "Nacimos con la misión de reunir todo lo que necesitás para vivir ese ritual como se merece. Desde la yerba más cuidadosamente seleccionada hasta el mate que se convierte en tuyo con el tiempo.",
    image: "/local/local-1.jpg",
    badgeTop: "Desde Argentina",
    badgeBottom: "Para cada ronda",
    stats: [
      { value: "100%", label: "Artesanal" },
      { value: "Premium", label: "Selección" },
      { value: "Local", label: "Argentino" },
      { value: "Ritual", label: "Compartido" },
    ],
  },
  local: {
    eyebrow: "El local",
    title: "Vení, elegí",
    titleHighlight: "y quedate un rato.",
    description: "Nuestro local físico es el punto de encuentro de los mateadores. Venís, tocás los productos, los olés y encontrás ese detalle que hace propio a tu ritual.",
    photos: [
      { src: "/local/local-1.jpg", alt: "Fachada y vidriera del local Poné La Pava" },
      { src: "/local/local-2.jpg", alt: "Estantería de termos Stanley y yerbas" },
      { src: "/local/local-3.jpg", alt: "Sector de mates artesanales y cuero" },
      { src: "/local/local-4.jpg", alt: "Exhibición de bombillas de alpaca y bolsos" },
      { src: "/local/local-5.jpg", alt: "Mates camioneros e imperiales en el local" },
      { src: "/local/local-6.jpg", alt: "Vista interior del salón matero" },
    ],
  },
  faqs: [
    {
      id: "1",
      category: "pagos",
      question: "¿Qué medios de pago aceptan?",
      answer: "Aceptamos transferencia bancaria, Mercado Pago y efectivo al retirar en nuestro local de Catriel. Cuando confirmás el pedido por WhatsApp te pasamos los datos para transferir o el link de pago.",
    },
    {
      id: "2",
      category: "pagos",
      question: "¿Cómo es el proceso de compra directa por WhatsApp?",
      answer: "Armás tu carrito en la web con los productos que desees y hacés clic en 'Pedir por WhatsApp'. El sistema genera automáticamente el detalle de tu compra y te atiende una persona del local para confirmar stock, pasarte los datos de pago y despacharlo en el día.",
    },
    {
      id: "3",
      category: "envios",
      question: "¿Hacen envíos a todo el país y cuánto tardan?",
      answer: "Despachamos a todo el país. El costo del envío lo coordinamos por WhatsApp al confirmar tu pedido, según tu localidad. También podés retirar sin cargo en nuestro local de Catriel.",
    },
    {
      id: "4",
      category: "curado",
      question: "¿Los mates vienen curados?",
      answer: "Los mates de madera o calabaza se entregan naturales para que cada cliente los cure según su gusto. Te adjuntamos la guía paso a paso con el mate y también podés consultarnos por WhatsApp.",
    },
    {
      id: "5",
      category: "garantia",
      question: "¿Tienen garantía los productos?",
      answer: "Todos nuestros mates, termos y bombillas cuentan con garantía por defectos de fabricación y control de calidad previo a cada entrega.",
    },
  ],
  reviews: [
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
  ],
  finalCta: {
    eyebrow: "Tu próximo mate empieza acá",
    titleLine1: "¿Listo para renovar",
    titleHighlight: "tu ritual diario?",
    description: "Yerbas seleccionadas, mates de calabaza brasilera con virola de alpaca y accesorios duraderos. Hacé tu pedido online en minutos con atención personalizada.",
    primaryButtonText: "Explorar Catálogo Completo",
    primaryButtonLink: "/catalogo",
    secondaryButtonText: "Asesoramiento por WhatsApp",
    secondaryButtonMessage: "¡Hola! Quiero consultar por productos y envíos.",
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

export const getLandingContent = cache(async (): Promise<LandingContent> => {
  try {
    const { data, error } = await supabase
      .from("landing_content")
      .select("content")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data || !data.content) {
      return DEFAULT_LANDING_CONTENT;
    }

    return {
      ...DEFAULT_LANDING_CONTENT,
      ...data.content,
      hero: { ...DEFAULT_LANDING_CONTENT.hero, ...(data.content.hero || {}) },
      promoBanner: { ...DEFAULT_LANDING_CONTENT.promoBanner, ...(data.content.promoBanner || {}) },
      about: { ...DEFAULT_LANDING_CONTENT.about!, ...(data.content.about || {}) },
      local: { ...DEFAULT_LANDING_CONTENT.local!, ...(data.content.local || {}) },
      finalCta: { ...DEFAULT_LANDING_CONTENT.finalCta!, ...(data.content.finalCta || {}) },
      announcements: data.content.announcements?.length ? data.content.announcements : DEFAULT_LANDING_CONTENT.announcements,
      galleryPosts: data.content.galleryPosts?.length ? data.content.galleryPosts : DEFAULT_LANDING_CONTENT.galleryPosts,
      faqs: data.content.faqs?.length ? data.content.faqs : DEFAULT_LANDING_CONTENT.faqs,
      reviews: data.content.reviews?.length ? data.content.reviews : DEFAULT_LANDING_CONTENT.reviews,
    };
  } catch {
    return DEFAULT_LANDING_CONTENT;
  }
});

// Writes straight to Supabase and throws on failure. An earlier version fell
// back to a module-level variable when the write failed, which made the admin
// show "guardado" for changes that only existed in one serverless instance and
// vanished on the next request — a false success, worse than an error.
export async function updateLandingContent(
  input: LandingContent,
): Promise<LandingContent> {
  const contentToSave: LandingContent = {
    ...input,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin().from("landing_content").upsert({
    id: "default",
    content: contentToSave,
    updated_at: contentToSave.updatedAt,
  });

  if (error) {
    throw new Error(
      `No se pudo guardar el contenido de la landing: ${error.message}. ` +
        "Verificá que la tabla landing_content exista (supabase-migration-store-integrity.sql).",
    );
  }

  return contentToSave;
}
