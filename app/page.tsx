import BenefitsSection from "@/components/BenefitsSection";
import ContactSection from "@/components/ContactSection";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white">
      <HeroSection />
      <BenefitsSection />
      <ContactSection />
    </div>
  );
}
