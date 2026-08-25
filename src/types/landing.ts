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
  galleryPosts: LandingGalleryPost[];
  updatedAt?: string;
}
