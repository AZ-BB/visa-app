import { FeaturedDestinations } from "@/components/landing-page/FeaturedDestinations";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing-page/Hero";
import { HowItWorks } from "@/components/landing-page/HowItWorks";
import { Navbar } from "@/components/layout/Navbar";
import { QA } from "@/components/landing-page/QA";
import { Testimonials } from "@/components/landing-page/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen text-gray-800">
      <Hero />
      <Testimonials />
      <HowItWorks />
      <FeaturedDestinations />
      <QA />
    </div>
  );
}
