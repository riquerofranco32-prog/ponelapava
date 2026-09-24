export interface LandingHero {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  titleLine3: string;
  subtitle: string;
  backgroundImage: string;
  videoUrl?: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
}

export interface LandingAnnouncementItem {
  id: string;
  highlight: string;
  text: string;
  badge?: string;
}

export interface LandingPromoBanner {
  active: boolean;
  badge: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

export interface LandingAbout {
  eyebrow: string;
  title: string;
  titleHighlight: string;
  quote: string;
  paragraph1: string;
  paragraph2: string;
  image: string;
  badgeTop: string;
  badgeBottom: string;
  stats: { value: string; label: string }[];
}

export interface LandingLocal {
  eyebrow: string;
  title: string;
  titleHighlight: string;
  description: string;
  photos: { src: string; alt: string }[];
}

export interface LandingFAQItem {
  id: string;
  category: "pagos" | "envios" | "curado" | "garantia";
  question: string;
  answer: string;
}

export interface LandingReviewItem {
  id: string;
  name: string;
  meta: string;
  time: string;
  text: string;
  rating: number;
}

export interface LandingFinalCta {
  eyebrow: string;
  titleLine1: string;
  titleHighlight: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonMessage: string;
}

export interface LandingGalleryPost {
  id: string;
  image: string;
  alt: string;
  link?: string;
}

export interface LandingContent {
  hero: LandingHero;
  announcements: LandingAnnouncementItem[];
  promoBanner: LandingPromoBanner;
  about?: LandingAbout;
  local?: LandingLocal;
  faqs?: LandingFAQItem[];
  reviews?: LandingReviewItem[];
  finalCta?: LandingFinalCta;
  galleryPosts: LandingGalleryPost[];
  updatedAt?: string;
}

