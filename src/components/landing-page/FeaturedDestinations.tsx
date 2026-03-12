"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

const DESTINATIONS = [
  { id: "united-states", nameKey: "unitedStates", descKey: "unitedStatesDesc", image: "/images/featured-1.png", imageAlt: "Empire State Building and New York City skyline" },
  { id: "australia", nameKey: "australia", descKey: "australiaDesc", image: "/images/featured-2.png", imageAlt: "Sydney Opera House and Sydney Harbour Bridge" },
  { id: "india", nameKey: "india", descKey: "indiaDesc", image: "/images/featured-3.png", imageAlt: "Taj Mahal with reflecting pool and gardens" },
];

export function FeaturedDestinations() {
  const t = useTranslations("landing.featured");
  return (
    <section
      id="featured"
      className="bg-primary-dark py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="text-[32px] sm:text-[36px] font-bold text-white ">
            {t("heading")}
          </h2>
          <p className="mt-4 text-lg text-white">
            {t("subheading")}
          </p>
        </header>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {DESTINATIONS.map((dest) => (
            <article
              key={dest.id}
              className=" rounded-[16px] h- bg-white shadow-[0_24px_48px_0_rgba(0,0,0,0.08)]"
            >
              <div className="relative rounded-t-[16px] w-full overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.imageAlt}
                  width={500}
                  height={500}
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-primary-copy">
                  {t(dest.nameKey)}
                </h3>
                <p className="mt-2 text-primary-copy text-lg sm:text-sm leading-relaxed">
                  {t(dest.descKey)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
