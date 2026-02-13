import Image from "next/image";

const DESTINATIONS = [
  {
    id: "united-states",
    name: "United States",
    description:
      "If you're eligible for the VWP (Visa Waiver Programme), you'll need to apply for an ESTA.",
    image: "/images/featured-1.png",
    imageAlt: "Empire State Building and New York City skyline",
  },
  {
    id: "australia",
    name: "Australia",
    description:
      "The most common visa option is the Australian Electronic Travel Authority (ETA), subclass 601.",
    image: "/images/featured-2.png",
    imageAlt: "Sydney Opera House and Sydney Harbour Bridge",
  },
  {
    id: "india",
    name: "India",
    description:
      "The e-Tourist Visa comes in 3 different durations and allows multiple entries for tourists.",
    image: "/images/featured-3.png",
    imageAlt: "Taj Mahal with reflecting pool and gardens",
  },
];

export function FeaturedDestinations() {
  return (
    <section
      id="featured"
      className="bg-primary-dark py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="text-[36px] font-bold text-white ">
            Featured destinations
          </h2>
          <p className="mt-4 text-[18px] text-white">
            We offer visas for all of the most popular destinations. Start your
            visa application for one of them now.
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
                <h3 className="text-[24px] font-bold text-primary-copy">
                  {dest.name}
                </h3>
                <p className="mt-2 text-primary-copy text-[14px] leading-relaxed">
                  {dest.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
