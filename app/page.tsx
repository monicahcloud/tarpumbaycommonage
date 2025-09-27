import BenefitsSection from "@/components/BenefitsSection";
// import ContactSection from "@/components/ContactSection";
import HeroSection from "@/components/HeroSection";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/portal");
  return (
    <div className="relative min-h-screen bg-white">
      <HeroSection />
      <BenefitsSection />
      {/* <ContactSection /> */}
    </div>
  );
}
