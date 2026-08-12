import { Product } from "@/types";

export const products: Product[] = [
  // ── YERBAS ──────────────────────────────────────────
  {
    id: "1",
    name: "Yerba Amanda Compuesta 500g",
    slug: "yerba-amanda-compuesta-500g",
    description: "Clásica yerba compuesta con palo, sabor equilibrado y suave.",
    longDescription:
      "Amanda Compuesta es una de las yerbas más queridas de Argentina. Con un blend equilibrado de hojas y palo, ofrece un sabor suave, sin amargor excesivo. Ideal para quienes empiezan o prefieren un mate tranquilo y de todos los días.",
    price: 2800,
    category: "yerbas",
    status: "featured",
    images: ["/product_yerba_amanda_1786546104213.png"],
    brand: "Amanda",
    weight: "500g",
    featured: true,
    tags: ["con palo", "suave", "clásica"],
  },
  {
    id: "2",
    name: "Yerba Taragüi Sin Palo 500g",
    slug: "yerba-taragui-sin-palo-500g",
    description: "Yerba sin palo, intensa y de sabor fuerte. Para los que lo quieren serio.",
    longDescription:
      "Taragüi Sin Palo está elaborada solo con hojas seleccionadas, lo que la hace más intensa y con mayor carga de sabor. Perfecta para los mateadores más exigentes que buscan un mate potente desde el primer sorbo.",
    price: 3200,
    category: "yerbas",
    status: "available",
    images: ["/product_yerba_amanda_1786546104213.png"],
    brand: "Taragüi",
    weight: "500g",
    featured: false,
    tags: ["sin palo", "intensa", "fuerte"],
  },
  {
    id: "3",
    name: "Yerba Playadito 1kg",
    slug: "yerba-playadito-1kg",
    description: "La clásica yerba correntina. Suave, aromática y tradicional.",
    longDescription:
      "Playadito es sinónimo de mate tranquilo. Oriunda de Corrientes, tiene un sabor delicado y un aroma característico que la hace única. En presentación de 1kg para el que no para de matear.",
    price: 4900,
    category: "yerbas",
    status: "available",
    images: ["/product_yerba_amanda_1786546104213.png"],
    brand: "Playadito",
    weight: "1kg",
    featured: false,
    tags: ["con palo", "suave", "correntina"],
  },
  {
    id: "4",
    name: "Yerba Cbsé Energía 500g",
    slug: "yerba-cbse-energia-500g",
    description: "Yerba compuesta con guaraná y hierbas energizantes. Un toque diferente.",
    longDescription:
      "Cbsé Energía combina la yerba mate con guaraná, ginseng y naranja. Una opción diferente para quienes buscan más energía y un sabor cítrico y especiado. Ideal para comenzar el día.",
    price: 3500,
    category: "yerbas",
    status: "available",
    images: ["/product_yerba_amanda_1786546104213.png"],
    brand: "Cbsé",
    weight: "500g",
    featured: false,
    tags: ["energizante", "guaraná", "especiada"],
  },

  // ── MATES ───────────────────────────────────────────
  {
    id: "5",
    name: "Mate Calabaza Cuero Natural",
    slug: "mate-calabaza-cuero-natural",
    description: "Mate de calabaza con aro y virola en alpaca. Curado y listo para usar.",
    longDescription:
      "Este mate de calabaza natural es curado a mano, con aro y virola en alpaca bañada. Tiene el sabor y el ritual de los mates de siempre. Cada uno es único, con su propia forma y color. Viene curado y listo para el primer mate.",
    price: 5500,
    category: "mates",
    status: "featured",
    images: ["/product_mate_calabaza_1786546121145.png"],
    brand: "Artesanal",
    featured: true,
    tags: ["calabaza", "alpaca", "artesanal", "curado"],
  },
  {
    id: "6",
    name: "Mate Imperial de Madera",
    slug: "mate-imperial-de-madera",
    description: "Mate imperial torneado en madera de palo santo. Robusto y elegante.",
    longDescription:
      "El mate imperial de madera de palo santo tiene un tamaño generoso, ideal para mateadas largas. Con terminación natural y aro en metal, es un clásico que mejora con el uso. Curado y listo.",
    price: 6800,
    category: "mates",
    status: "available",
    images: ["/product_mate_calabaza_1786546121145.png"],
    brand: "Artesanal",
    featured: true,
    tags: ["madera", "imperial", "palo santo"],
  },
  {
    id: "7",
    name: "Mate Acero Inoxidable Premium",
    slug: "mate-acero-inoxidable-premium",
    description: "Mate de acero inoxidable 304. Duradero, higiénico y moderno.",
    longDescription:
      "Para quienes prefieren la practicidad sin perder identidad. Este mate de acero inoxidable 304 es durable, higiénico y perfecto para llevar al trabajo o de viaje. No necesita curado.",
    price: 4200,
    category: "mates",
    status: "available",
    images: ["/product_mate_calabaza_1786546121145.png"],
    brand: "ProMate",
    featured: false,
    tags: ["acero", "moderno", "práctico"],
  },
  {
    id: "8",
    name: "Mate Camionero Grande",
    slug: "mate-camionero-grande",
    description: "El mate grande para compartir. Ideal para mateadas en grupo.",
    longDescription:
      "El camionero es el mate que no se acaba. Con un tamaño extra-grande, es perfecto para rondas largas y mateadas en familia. De calabaza reforzada con virola de acero.",
    price: 7200,
    category: "mates",
    status: "out_of_stock",
    images: ["/product_mate_calabaza_1786546121145.png"],
    brand: "Artesanal",
    featured: false,
    tags: ["grande", "camionero", "calabaza"],
  },

  // ── BOMBILLAS ───────────────────────────────────────
  {
    id: "9",
    name: "Bombilla Alpaca Lisa 18cm",
    slug: "bombilla-alpaca-lisa-18cm",
    description: "Bombilla de alpaca bañada clásica. Filtro de punta oval.",
    longDescription:
      "La bombilla de alpaca bañada es la más versátil del mercado. Con 18cm de largo y filtro de punta oval, funciona perfecto en mates de calabaza y madera. Fácil de limpiar y muy durable.",
    price: 1800,
    category: "bombillas",
    status: "available",
    images: ["/category_bombillas_1786546023442.png"],
    brand: "Artesanal",
    featured: false,
    tags: ["alpaca", "clásica", "oval"],
  },
  {
    id: "10",
    name: "Bombilla Acero Filtrante Premium",
    slug: "bombilla-acero-filtrante-premium",
    description: "Bombilla de acero inoxidable con filtro tipo bombilla premium anti-grumos.",
    longDescription:
      "La bombilla filtrante de acero inoxidable 316 es la favorita de quienes toman yerba sin palo o yerba fina. El filtro especial evita el paso de grumos y da un mate limpio y fluido.",
    price: 2900,
    category: "bombillas",
    status: "featured",
    images: ["/category_bombillas_1786546023442.png"],
    brand: "ProFilter",
    featured: true,
    tags: ["acero", "filtrante", "premium", "sin grumos"],
  },
  {
    id: "11",
    name: "Bombilla Cucharita Artesanal",
    slug: "bombilla-cucharita-artesanal",
    description: "Bombilla de cucharita en alpaca. La clásica favorita del campo.",
    longDescription:
      "La bombilla de cucharita es un ícono del mate argentino. Con forma de cuchara en la punta, mezcla la yerba suavemente y da un mate con mucho cuerpo. Ideal para yerbas con palo.",
    price: 1600,
    category: "bombillas",
    status: "available",
    images: ["/category_bombillas_1786546023442.png"],
    brand: "Artesanal",
    featured: false,
    tags: ["cucharita", "alpaca", "campo"],
  },

  // ── TERMOS ──────────────────────────────────────────
  {
    id: "12",
    name: "Termo Stanley Clásico 1L",
    slug: "termo-stanley-clasico-1l",
    description: "El termo que todos conocen. 1L, acero inoxidable, 12hs de calor.",
    longDescription:
      "El Stanley Clásico es el rey de los termos. Con 1 litro de capacidad, doble pared de acero inoxidable y tapa-jarra, mantiene el agua caliente por 12 horas. Verde botella, como tiene que ser.",
    price: 18900,
    category: "termos",
    status: "featured",
    images: ["/category_termos_1786546003986.png"],
    brand: "Stanley",
    featured: true,
    tags: ["stanley", "1L", "premium", "12hs"],
  },
  {
    id: "13",
    name: "Termo Lumilagro 1L",
    slug: "termo-lumilagro-1l",
    description: "El termo nacional de siempre. Clásico, económico y confiable.",
    longDescription:
      "Lumilagro es el termo argentino de toda la vida. Con 1 litro de capacidad, conserva el calor por 8 horas. La tapa sirve de taza y el diseño rojo/verde lo hace inconfundible.",
    price: 8900,
    category: "termos",
    status: "available",
    images: ["/category_termos_1786546003986.png"],
    brand: "Lumilagro",
    featured: false,
    tags: ["lumilagro", "nacional", "clásico"],
  },
  {
    id: "14",
    name: "Termo Stanley Adventure 1.5L",
    slug: "termo-stanley-adventure-15l",
    description: "El hermano mayor del Stanley. 1.5L para las mateadas más largas.",
    longDescription:
      "El Stanley Adventure lleva todo al siguiente nivel. Con 1.5 litros de capacidad, mantiene el agua caliente por 18 horas. Resistente a golpes y con asa de transporte. Para los que no quieren parar.",
    price: 24500,
    category: "termos",
    status: "available",
    images: ["/category_termos_1786546003986.png"],
    brand: "Stanley",
    featured: false,
    tags: ["stanley", "1.5L", "adventure", "18hs"],
  },

  // ── ACCESORIOS ──────────────────────────────────────
  {
    id: "15",
    name: "Posamate de Cuero Artesanal",
    slug: "posamate-de-cuero-artesanal",
    description: "Posamate de cuero vegetal repujado. Protege tu mesa con estilo.",
    longDescription:
      "Este posamate artesanal de cuero vegetal repujado es hecho a mano. Protege tu mesa del calor del mate y le da un toque de identidad a tu espacio. Viene con grabado del símbolo de la yerba.",
    price: 2200,
    category: "accesorios",
    status: "available",
    images: ["/about_section_1786546070863.png"],
    brand: "Artesanal",
    featured: false,
    tags: ["cuero", "artesanal", "repujado"],
  },
  {
    id: "16",
    name: "Limpiabombillas de Bambú x3",
    slug: "limpiabombillas-bambu-x3",
    description: "Set de 3 limpiabombillas de bambú para mantener tu equipo impecable.",
    longDescription:
      "Tres limpiabombillas de diferentes tamaños para limpiar a fondo tu bombilla. Hechos de bambú natural, son biodegradables y efectivos. El kit perfecto para mantener el sabor del mate.",
    price: 1100,
    category: "accesorios",
    status: "available",
    images: ["/about_section_1786546070863.png"],
    brand: "Eco Mate",
    featured: false,
    tags: ["limpieza", "bambú", "eco"],
  },
  {
    id: "17",
    name: "Bolsita de Yerba Reusable",
    slug: "bolsita-de-yerba-reusable",
    description: "Bolsita de tela reutilizable para guardar tu yerba.",
    longDescription:
      "Una bolsita de tela de algodón orgánico con cierre hermético para guardar tu yerba fresca y sin olores. Imprimida con el símbolo del mate, es práctica y sostenible.",
    price: 850,
    category: "accesorios",
    status: "available",
    images: ["/about_section_1786546070863.png"],
    brand: "Eco Mate",
    featured: false,
    tags: ["eco", "algodón", "sustentable"],
  },

  // ── COMBOS ──────────────────────────────────────────
  {
    id: "18",
    name: "Kit Matero Completo — Iniciación",
    slug: "kit-matero-completo-iniciacion",
    description: "Todo lo que necesitás para empezar: mate, bombilla, yerba y termo.",
    longDescription:
      "El kit perfecto para quien quiere empezar o para regalar. Incluye: Mate de calabaza curado, bombilla de alpaca, 500g de yerba Amanda y Termo Lumilagro 1L. Todo en una caja de regalo kraft.",
    price: 18500,
    category: "combos",
    status: "featured",
    images: ["/product_combo_kit_1786546132809.png"],
    brand: "Poné La Pava",
    featured: true,
    tags: ["combo", "regalo", "iniciación", "kit completo"],
  },
  {
    id: "19",
    name: "Kit Matero Premium — Stanley",
    slug: "kit-matero-premium-stanley",
    description: "Mate Imperial, bombilla premium, yerba Taragüi sin palo y Stanley 1L.",
    longDescription:
      "El combo para los que no se conforman con cualquier cosa. Incluye: Mate imperial de madera, Bombilla filtrante acero, 500g de Taragüi Sin Palo y Stanley Clásico 1L. Presentación premium en caja de madera.",
    price: 32800,
    category: "combos",
    status: "available",
    images: ["/product_combo_kit_1786546132809.png"],
    brand: "Poné La Pava",
    featured: true,
    tags: ["combo", "premium", "stanley", "regalo"],
  },
  {
    id: "20",
    name: "Kit de Regalo Artesanal",
    slug: "kit-de-regalo-artesanal",
    description: "Mate calabaza, bombilla cucharita, 2 yerbas y posamate de cuero.",
    longDescription:
      "Un kit pensado para regalar en cualquier ocasión. Mate de calabaza curado, bombilla de cucharita, dos variedades de 250g de yerba y posamate de cuero repujado. Envuelto en papel kraft con sello de la marca.",
    price: 22000,
    category: "combos",
    status: "available",
    images: ["/product_combo_kit_1786546132809.png"],
    brand: "Poné La Pava",
    featured: false,
    tags: ["regalo", "artesanal", "kit"],
  },
];

export const featuredProducts = products.filter((p) => p.featured);

export const getProductById = (id: string): Product | undefined =>
  products.find((p) => p.id === id);

export const getProductBySlug = (slug: string): Product | undefined =>
  products.find((p) => p.slug === slug);

export const getProductsByCategory = (category: string): Product[] =>
  products.filter((p) => p.category === category);

export const getRelatedProducts = (product: Product, limit = 4): Product[] =>
  products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
