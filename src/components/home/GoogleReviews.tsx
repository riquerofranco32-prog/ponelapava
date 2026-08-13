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
    <div className="mb-4 rounded-card border border-pava-brown/8 bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: avatarColor(name) }}
          aria-hidden="true"
        >
          {name[0]}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-pava-brown">
            {name}
          </div>
          <div className="truncate text-[11px] text-pava-brown-mid/55">
            {meta} · {time}
          </div>
        </div>
      </div>
      <Stars />
      <p className="mt-2 text-[13px] leading-relaxed text-pava-brown-mid/85">
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}

function ReviewChip({ name, time }: RatingOnlyReview) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-control border border-pava-brown/8 bg-white px-4 py-3">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ background: avatarColor(name) }}
        aria-hidden="true"
      >
        {name[0]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold text-pava-brown">
          {name}
        </div>
        <Stars size={10} />
      </div>
      <span className="shrink-0 text-[10px] text-pava-brown-mid/45">
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
  const doubled = [...items, ...items];
  return (
    <div className="marquee-vertical-mask h-full overflow-hidden">
      <div
        className="marquee-vertical-track"
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((r, i) =>
          isWritten(r) ? (
            <ReviewCard key={i} {...r} />
          ) : (
            <ReviewChip key={i} {...r} />
          ),
        )}
      </div>
    </div>
  );
}

export default function GoogleReviews() {
  return (
    <section className="overflow-hidden bg-pava-cream-dark py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <ScrollReveal
          direction="up"
          className="mb-12 flex flex-col items-center gap-4 text-center"
        >
          <div className="mb-1 flex items-center gap-3">
            <span className="h-px w-9 bg-pava-gold-deep" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold-deep">
              Lo que dicen en Google
            </span>
            <span className="h-px w-9 bg-pava-gold-deep" />
          </div>
          <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-pava-brown sm:text-5xl">
            5.0 de calificación,
            <br />
            <em className="not-italic text-pava-green">6 reseñas reales.</em>
          </h2>
          <a
            href={GOOGLE_PLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-1 inline-flex items-center gap-2 text-sm font-semibold text-pava-brown transition-colors hover:text-pava-green"
          >
            <Stars size={16} />
            Ver reseñas en Google
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
