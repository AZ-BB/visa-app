import Image from "next/image"
import { Stats } from "./Stats"
import Dots from "../svgs/dots"
import { VisaSelector } from "./VisaSelector"

export function Hero() {
  return (
    <section className="relative pt-8 md:pt-24">
      <div className="mx-auto max-w-7xl px-6 relative">
        <div className="flex gap-12 lg:gap-28 w-full">
          <div className="w-full mt-6">
            <h1 className="w-full text-center sm:text-left text-[52px] md:text-[64px] sm:text-[80px] font-bold leading-tight tracking-tight text-primary-copy ">
              Your <span className="text-[#fd7835]">journey</span> <br />{" "}
              starts here
            </h1>
            <p className="mt-6 mb-10 w-full md:w-[46%]  md:text-base lg:text-[18px] text-secondary-copy text-center sm:text-left">
              Choose the country you&apos;re traveling to, and we&apos;ll let
              you know if you need a visa.
              <br className="md:hidden block" />
              Then all we need are some
              details for each traveller to get you on your way.
            </p>
            <div
              id="hero-visa-selector"
              className=" top-20 z-40 w-full flex justify-center "
            >
              <VisaSelector />
            </div>
            <div className="w-full md:w-1/2">
              <Stats />
            </div>
          </div>
          <div className="absolute -z-50 md:flex hidden right-10 top-0 items-center justify-center lg:justify-end overflow-hidden">
            <div className="flex items-center justify-center relative">
              <div className="absolute -top-20 right-10 z-0">
                <Dots />
              </div>
              <div className="absolute bottom-16 -left-16 z-0">
                <Dots />
              </div>
              <div className="rounded-xl z-0">
                <Image
                  src={"/images/hero-1.png"}
                  width={516}
                  height={622}
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
