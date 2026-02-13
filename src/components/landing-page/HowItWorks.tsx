import Image from "next/image"

const STEPS = [
  {
    number: 1,
    title: "Choose your destination",
    description:
      "Let us know where you're travelling from, and where you're travelling to.",
  },
  {
    number: 2,
    title: "Add your travellers",
    description:
      "If a visa is needed, then all we need to know is who will be travelling.",
  },
  {
    number: 3,
    title: "Sit back and relax",
    description:
      "Carry on planning your trip while we take care of the heavy lifting.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className=" py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-center items-center gap-10 sm:gap-32 ">
        {/* Left: Image with airplane overlay */}
        <div className="relative min-h-[280px] scale-80 md:scale-100 -translate-x-3 sm:-translate-x-0">
          <Image
            src="/images/how-it-works-1.png"
            alt="Open suitcase with travel essentials on wooden floor"
            width={516}
            height={516}
            className="object-cover rounded-[28px] m-10"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <Image
            src="/images/how-it-works-2.png"
            alt="Open suitcase with travel essentials on wooden floor"
            width={516}
            height={516}
            className="object-cover absolute -bottom-3 -left-5"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

        </div>

        {/* Right: Heading and steps */}
        <div className="flex flex-col justify-center py-5 sm:ph-20">
          <h2 className="text-[36px] font-bold text-primary-copy sm:text-left text-center">
            How it works
          </h2>
          <ul className="mt-8 space-y-10 sm:space-y-6">
            {STEPS.map((step) => (
              <li key={step.number} className="flex gap-4 flex-col sm:flex-row w-full items-center">
                <span
                  className="flex h-[64px] w-[64px] shrink-0 items-center justify-center bg-[#F3F6FC] rounded-full text-[24px] font-bold text-primary"
                  aria-hidden
                >
                  {step.number}
                </span>
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-[24px] text-primary-copy">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[18px] text-secondary-copy">{step.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
