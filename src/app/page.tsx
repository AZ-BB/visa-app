import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Navbar } from "@/components/Navbar";
import { Testimonials } from "@/components/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen text-gray-800">
      <Navbar />
      <Hero />
      <Testimonials />
      <HowItWorks />
      <Footer />
    </div>
  );
}
