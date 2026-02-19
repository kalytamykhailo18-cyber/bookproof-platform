import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { StatsSection } from './StatsSection';
import { HowItWorksSection } from './HowItWorksSection';
import { FeaturesSection } from './FeaturesSection';
import { ForAuthorsSection } from './ForAuthorsSection';
import { ForReadersSection } from './ForReadersSection';
import { TrustSection } from './TrustSection';
import { GuaranteeSection } from './GuaranteeSection';
import { PricingSection } from './PricingSection';
import { TestimonialsSection } from './TestimonialsSection';
import { FAQSection } from './FAQSection';
import { LeadCaptureSection } from './LeadCaptureSection';
import { ContactSection } from './ContactSection';
import { CTABannerSection } from './CTABannerSection';
import { LandingFooter } from './LandingFooter';

export function LandingPage() {
  return (
    <div>
      {/* Fixed navigation */}
      <LandingNav />

      {/* 1. Hero — dark bg close to primary blue */}
      <HeroSection />

      {/* 2. Platform stats */}
      <StatsSection />

      {/* 3. How It Works — 4 steps */}
      <HowItWorksSection />

      {/* 4. Platform features grid */}
      <FeaturesSection />

      {/* 5. For Authors section */}
      <ForAuthorsSection />

      {/* 6. For Readers section */}
      <ForReadersSection />

      {/* 7. Trust & credibility */}
      <TrustSection />

      {/* 8. 14-day guarantee */}
      <GuaranteeSection />

      {/* 9. Pricing packages */}
      <PricingSection />

      {/* 10. Testimonials */}
      <TestimonialsSection />

      {/* 11. FAQ accordion */}
      <FAQSection />

      {/* 12. Lead capture form */}
      <LeadCaptureSection />

      {/* 13. Contact channels */}
      <ContactSection />

      {/* 14. CTA banner */}
      <CTABannerSection />

      {/* 15. Footer */}
      <LandingFooter />
    </div>
  );
}
