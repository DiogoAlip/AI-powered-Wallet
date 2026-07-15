import { LandingHeader } from "../components/LandingHeader";
import { HeroSection } from "../components/HeroSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { TestimonialSection } from "../components/TestimonialSection";
import { CtaSection } from "../components/CtaSection";
import { PricingSection } from "../components/PricingSection";
import { LandingFooter } from "../components/LandingFooter";

export function HomePage() {
  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans min-h-screen flex flex-col selection:bg-teal-200">
      <LandingHeader />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialSection />
      <CtaSection />
      <PricingSection />
      <LandingFooter />
    </div>
  );
}
