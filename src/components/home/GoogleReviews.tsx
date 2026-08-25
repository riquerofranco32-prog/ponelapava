import { Star, ExternalLink } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

// Real reviews from Poné La Pava's Google Maps listing (5.0, 6 reseñas) —
// only the two that actually left written text are quoted; the other four
// left a star rating with no comment, and are shown as such below rather
// than inventing text for them.
const GOOGLE_PLACE_URL =
  "https://www.google.com/maps/place/Pon%C3%A9+la+pava/@-37.8839523,-67.8090713,14.62z/data=!4m8!3m7!1s0x960acb005520266d:0x9a1a68896ad3d5a9!8m2!3d-37.8827105!4d-67.7981453!9m1!1b1!16s%2Fg%2F11mlfl_28d";

interface WrittenReview {
  name: string;
  meta: string;
  time: string;
  text: string;
}

interface RatingOnlyReview {
  name: string;
  time: string;
}

const WRITTEN: WrittenReview[] = [
  {
    name: "Cristian Casagrande",
    meta: "4 reseñas · 1 foto",
    time: "Hace 8 meses",
    text: "Productos de calidad, excelente atención.",
  },
  {
    name: "Victoria Ruiz",
    meta: "Local Guide · 197 reseñas",
    time: "Hace 3 meses",
    text: "Sitio impecable, atención esmerada de Pilar; todo lo que se necesita para un buen Mate; excelente!!!",
  },
];

const RATING_ONLY: RatingOnlyReview[] = [
  { name: "Sandro Lacon", time: "Hace 4 meses" },
  { name: "Pilar Lacon", time: "Hace 4 meses" },
  { name: "Mariana Mauad", time: "Hace 6 meses" },
  { name: "hana violeta", time: "Hace 6 meses" },
];

const AVATAR_COLORS = [
  "var(--color-pava-green)",
  "var(--color-pava-terracotta)",
  "var(--color-pava-gold-deep)",
  "var(--color-pava-olive)",
];

function avatarColor(name: string): string {
  const sum = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function Stars({ size = 12 }: { size?: number }) {
  return (
    <div className="flex gap-0.5 text-pava-gold" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}

function ReviewCard({ name, meta, time, text }: WrittenReview) {
  return (
    <div className="mb-4 rounded-card border border-pava-brown/10 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-pava-green/30">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
            style={{ background: avatarColor(name) }}
            aria-hidden="true"
          >
            {name[0]}
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-pava-brown">
              {name}
            </div>
            <div className="truncate text-[11px] text-pava-brown-mid/60">
              {meta} · {time}
            </div>
          </div>
        </div>
        <span className="shrink-0 rounded-chip bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
          ✓ Verificada
        </span>
      </div>
      <Stars size={14} />
      <p className="mt-2.5 text-[13px] leading-relaxed text-pava-brown-mid/90 font-medium">
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}

function ReviewChip({ name, time }: RatingOnlyReview) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-control border border-pava-brown/8 bg-white px-4 py-3 shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ background: avatarColor(name) }}
          aria-hidden="true"
        >
          {name[0]}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-pava-brown">
            {name}
          </div>
          <Stars size={11} />
        </div>
      </div>
      <span className="shrink-0 text-[10px] text-pava-brown-mid/50 font-medium">
        {time}
      </span>
    </div>
  );
}

// Two columns, each mixing the two real quotes with the rating-only
// reviews in a different order so the columns don't feel identical —
// still 100% real content, just interleaved differently.
const COLUMN_A = [
  WRITTEN[0],
  RATING_ONLY[0],
  WRITTEN[1],
  RATING_ONLY[1],
  RATING_ONLY[2],
];
const COLUMN_B = [
  WRITTEN[1],
  RATING_ONLY[3],
  WRITTEN[0],
  RATING_ONLY[2],
  RATING_ONLY[0],
];

function isWritten(r: WrittenReview | RatingOnlyReview): r is WrittenReview {
  return "text" in r;
}

function Column({
  items,
  duration,
}: {
  items: (WrittenReview | RatingOnlyReview)[];
  duration: number;
}) {
  const renderItems = (list: typeof items) =>
    list.map((r, i) =>
      isWritten(r) ? (
        <ReviewCard key={i} {...r} />
      ) : (
        <ReviewChip key={i} {...r} />
      ),
    );
  return (
    <div className="marquee-vertical-mask h-full overflow-hidden">
      <div
        className="marquee-vertical-track"
        style={{ animationDuration: `${duration}s` }}
      >
        {renderItems(items)}
        <div aria-hidden="true" className="contents">
          {renderItems(items)}
        </div>
      </div>
    </div>
  );
}

export default function GoogleReviews() {
  return (
    <section className="overflow-hidden bg-pava-cream-dark py-20 sm:py-24 lg:py-28 border-y border-pava-brown/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <ScrollReveal
          direction="up"
          className="mb-12 flex flex-col items-center gap-4 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-pava-gold/40 bg-white/80 px-4 py-1.5 backdrop-blur-sm shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-pava-brown">
              Google Maps Rating · 5.0 ★
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-pava-brown sm:text-5xl lg:text-6xl">
            Lo que dicen quienes
            <br />
            <em className="not-italic text-pava-green">comparten la ronda.</em>
          </h2>
          <a
            href={GOOGLE_PLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-2 inline-flex items-center gap-2.5 rounded-control border border-pava-brown/20 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-pava-brown shadow-xs transition-all hover:border-pava-green hover:text-pava-green hover:shadow-sm"
          >
            <Stars size={15} />
            Ver perfil y reseñas en Google Maps
            <ExternalLink
              size={13}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </a>
        </ScrollReveal>

        <ScrollReveal direction="scale">
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2"
            style={{ height: 560 }}
          >
            <Column items={COLUMN_A} duration={38} />
            <div className="hidden sm:block">
              <Column items={COLUMN_B} duration={46} />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
