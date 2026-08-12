import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { InstagramIcon } from "@/components/ui/icons";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/site";

// Fotos reales del feed @ponelapava_yerbas (no stock).
const instagramPosts = [
  {
    id: "1",
    image: "/ig_storefront.jpg",
    alt: "Local de Poné La Pava en Catriel",
  },
  {
    id: "2",
    image: "/ig_shelf.jpg",
    alt: "Estantería de accesorios en el local",
  },
  {
    id: "3",
    image: "/ig_termos.jpg",
    alt: "Termos Stanley en exhibición",
  },
  {
    id: "4",
    image: "/ig_sara.jpg",
    alt: "Yerbas Sara en el local",
  },
  {
    id: "5",
    image: "/ig_bombillas.jpg",
    alt: "Mates con virola en exhibición",
  },
];

export default function InstagramSection() {
  return (
    <section className="overflow-hidden bg-pava-cream-dark py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <ScrollReveal
          direction="up"
          className="mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-pava-terracotta" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-terracotta">
                La ronda sigue
              </span>
            </div>
            <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-brown sm:text-5xl lg:text-6xl">
              Lo que pasa
              <br />
              <em className="not-italic text-pava-green">
                alrededor del mate.
              </em>
            </h2>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 border-b border-pava-brown pb-1 text-sm font-semibold text-pava-brown transition-colors hover:border-pava-terracotta hover:text-pava-terracotta"
          >
            <InstagramIcon /> @{INSTAGRAM_HANDLE}{" "}
            <span aria-hidden="true">↗</span>
          </a>
        </ScrollReveal>

        <ScrollReveal direction="scale">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5 lg:gap-4">
            {instagramPosts.map((post) => (
              <a
                key={post.id}
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden bg-pava-brown"
                aria-label={post.alt}
              >
                <Image
                  src={post.image}
                  alt={post.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  sizes="(max-width: 1024px) 50vw, 20vw"
                />
                <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-pava-brown/80 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:p-4">
                  <span className="text-xs text-pava-gold">Ver post ↗</span>
                </div>
              </a>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
