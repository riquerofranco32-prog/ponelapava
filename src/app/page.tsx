import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CustomKitBuilder from "@/components/home/CustomKitBuilder";
import ComboPacksSection from "@/components/home/ComboPacksSection";
import Categories from "@/components/home/Categories";
import BrandsSection from "@/components/home/BrandsSection";
import MateroExperienceHub from "@/components/home/MateroExperienceHub";
import AboutSection from "@/components/home/AboutSection";
import LocalSection from "@/components/home/LocalSection";
import GoogleReviews from "@/components/home/GoogleReviews";
import HowToBuy from "@/components/home/HowToBuy";
import FAQSection from "@/components/home/FAQSection";
import FinalCTA from "@/components/home/FinalCTA";
import InstagramSection from "@/components/home/InstagramSection";

// Products come from Supabase and are editable from /admin — revalidate
// periodically instead of baking them in at build time.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Poné La Pava — Yerbas, Mates y Accesorios Premium",
  description:
    "Especialistas en la cultura del mate. Yerbas seleccionadas, mates artesanales, termos, bombillas y todo lo que necesitás para el mate perfecto. Local físico y envíos.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <HowToBuy />
      <FeaturedProducts />
      <ComboPacksSection />
      <CustomKitBuilder />
      <AboutSection />
      <Categories />
      <BrandsSection />
      <MateroExperienceHub />
      <LocalSection />
      <GoogleReviews />
      <FAQSection />
      <FinalCTA />
      <InstagramSection />
    </>
  );
}
