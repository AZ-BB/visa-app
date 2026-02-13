import { FeaturedDestinations } from "@/components/FeaturedDestinations";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Navbar } from "@/components/Navbar";
import { QA } from "@/components/QA";
import { Testimonials } from "@/components/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen text-gray-800">
      <Navbar />
      <Hero />
      <Testimonials />
      <HowItWorks />
      <FeaturedDestinations />
      <QA />
    </div>
  );
}
