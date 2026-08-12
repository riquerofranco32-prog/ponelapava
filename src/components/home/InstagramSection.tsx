import Image from "next/image";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

// Placeholder Instagram posts using our generated images
const instagramPosts = [
  {
    id: "1",
    image: "/product_mate_calabaza_1786546121145.png",
    alt: "Mate de calabaza artesanal",
    likes: 234,
  },
  {
    id: "2",
    image: "/category_yerbas_1786545980521.png",
    alt: "Selección de yerbas",
    likes: 189,
  },
  {
    id: "3",
    image: "/product_combo_kit_1786546132809.png",
    alt: "Kit matero completo",
    likes: 412,
  },
  {
    id: "4",
    image: "/category_mates_1786545993698.png",
    alt: "Colección de mates",
    likes: 298,
  },
  {
    id: "5",
    image: "/about_section_1786546070863.png",
    alt: "Compartiendo mate",
    likes: 521,
  },
  {
    id: "6",
    image: "/category_combos_1786546035458.png",
    alt: "Combos de regalo",
    likes: 176,
  },
];

export default function InstagramSection() {
  return (
    <section className="py-20 lg:py-28 bg-pava-cream-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 lg:mb-14 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-pava-green" />
              <span className="text-xs tracking-[0.2em] uppercase text-pava-green font-medium">
                Instagram
              </span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-pava-brown">
              Seguinos en<br />
              <em className="not-italic text-pava-green">Instagram</em>
            </h2>
            <p className="mt-3 text-pava-brown-mid/70">
              @ponelapava_yerbas
            </p>
          </div>
          <a
            href="https://www.instagram.com/ponelapava_yerbas/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-pava-brown text-sm font-semibold tracking-wide border-2 border-pava-brown hover:bg-pava-brown hover:text-pava-cream transition-all duration-200 shrink-0"
          >
            <InstagramIcon size={16} />
            Ver Instagram
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href="https://www.instagram.com/ponelapava_yerbas/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden block"
              aria-label={post.alt}
            >
              <Image
                src={post.image}
                alt={post.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-pava-green/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex items-center gap-2 text-pava-cream text-sm font-medium">
                  <InstagramIcon size={18} />
                  <span>{post.likes}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-4 text-center text-xs text-pava-brown-mid/40">
          Contenido de muestra — las publicaciones reales se conectarán próximamente
        </p>
      </div>
    </section>
  );
}
