import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { InstagramIcon } from "@/components/ui/icons";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/site";

const instagramPosts = [
  {
    id: "1",
    image: "/product_mate_calabaza_1786546121145.png",
    alt: "Mate de calabaza artesanal",
  },
  {
    id: "2",
    image: "/category_yerbas_1786545980521.png",
    alt: "Selección de yerbas",
  },
  {
    id: "3",
    image: "/product_combo_kit_1786546132809.png",
    alt: "Kit matero completo",
  },
  {
    id: "4",
    image: "/category_mates_1786545993698.png",
    alt: "Colección de mates",
  },
  {
    id: "5",
    image: "/about_section_1786546070863.png",
    alt: "Compartiendo mate",
  },
  {
    id: "6",
    image: "/category_combos_1786546035458.png",
    alt: "Combos de regalo",
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
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:h-[32rem] lg:grid-cols-12 lg:grid-rows-2 lg:gap-4">
            {instagramPosts.map((post, index) => (
              <a
                key={post.id}
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  "group relative block aspect-square overflow-hidden bg-pava-brown " +
                  (index < 2
                    ? "lg:col-span-4 lg:row-span-2 lg:aspect-auto"
                    : "lg:col-span-2 lg:aspect-auto")
                }
                aria-label={post.alt}
              >
                <Image
                  src={post.image}
                  alt={post.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  sizes={
                    index < 2
                      ? "(max-width: 1024px) 50vw, 33vw"
                      : "(max-width: 1024px) 50vw, 17vw"
                  }
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
