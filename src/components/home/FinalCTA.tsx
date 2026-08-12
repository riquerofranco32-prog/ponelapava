import Image from "next/image";
import Link from "next/link";
import { whatsappChatUrl } from "@/lib/whatsapp";

export default function FinalCTA() {
  return (
    <section className="grain-overlay relative overflow-hidden bg-pava-brown py-24 sm:py-28 lg:py-40">
      <div className="absolute inset-0">
        <Image
          src="/about_section_1786546070863.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-pava-brown/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-pava-brown via-pava-brown/55 to-pava-brown/15" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <div className="mb-7 flex items-center gap-3">
            <span className="h-px w-10 bg-pava-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold">
              El mate te espera
            </span>
          </div>
          <h2 className="font-display text-5xl font-bold leading-[0.89] tracking-tight text-pava-cream sm:text-6xl lg:text-7xl xl:text-8xl">
            ¿Ya sabés qué vas
            <br />a poner en la{" "}
            <em className="not-italic text-pava-gold">pava?</em>
          </h2>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-pava-cream/75 sm:text-lg">
            Encontrá piezas elegidas para que cada mate tenga su propia
            historia.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-3 border-2 border-pava-gold bg-pava-gold px-8 py-4 text-sm font-bold tracking-wide text-pava-brown transition-all duration-200 hover:border-pava-gold-light hover:bg-pava-gold-light active:scale-[0.98]"
            >
              Ver el catálogo <span aria-hidden="true">→</span>
            </Link>
            <a
              href={whatsappChatUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 border border-pava-cream/35 bg-pava-brown/20 px-8 py-4 text-sm font-semibold tracking-wide text-pava-cream backdrop-blur-sm transition-all duration-200 hover:border-whatsapp hover:bg-whatsapp"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
