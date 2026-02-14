import { FeaturedDestinations } from "@/components/landing-page/FeaturedDestinations";
import { Hero } from "@/components/landing-page/Hero";
import { HowItWorks } from "@/components/landing-page/HowItWorks";
import { QA } from "@/components/landing-page/QA";
import { StickyVisaBar } from "@/components/layout/StickyVisaBar";
import { Testimonials } from "@/components/landing-page/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen text-gray-800">
      <StickyVisaBar />
      <Hero />
      <Testimonials />
      <HowItWorks />
      <FeaturedDestinations />
      <QA />
    </div>
  );
}
