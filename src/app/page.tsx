import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ComboPacksSection from "@/components/home/ComboPacksSection";
import CustomKitBuilder from "@/components/home/CustomKitBuilder";
import BrandsSection from "@/components/home/BrandsSection";
import HowToBuy from "@/components/home/HowToBuy";
import LocalSection from "@/components/home/LocalSection";
import GoogleReviews from "@/components/home/GoogleReviews";
import AboutSection from "@/components/home/AboutSection";
import FAQSection from "@/components/home/FAQSection";
import InstagramSection from "@/components/home/InstagramSection";
import FinalCTA from "@/components/home/FinalCTA";
import { getLandingContent } from "@/lib/landing";

// Products and landing content come from Supabase and are editable from /admin — revalidate
// periodically instead of baking them in at build time.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Poné La Pava — Yerbas, Mates y Accesorios Premium",
  description:
    "Especialistas en la cultura del mate. Yerbas seleccionadas, mates artesanales, termos, bombillas y todo lo que necesitás para el mate perfecto. Local físico y envíos.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const landing = await getLandingContent();

  return (
    <>
      <Hero content={landing.hero} />
      <TrustBar />
      <Categories />
      <FeaturedProducts />
      <ComboPacksSection />
      <CustomKitBuilder />
      <BrandsSection />
      <HowToBuy />
      <LocalSection />
      <GoogleReviews />
      <AboutSection />
      <FAQSection />
      <InstagramSection posts={landing.galleryPosts} />
      <FinalCTA />
    </>
  );
}
