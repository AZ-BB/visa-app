import Image from "next/image"
import { Stats } from "./Stats"
import Dots from "../svgs/dots"
import { VisaSelector } from "./VisaSelector"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 md:pt-24">
      <div className="mx-auto max-w-7xl px-6 relative">
        <div className="flex gap-12 lg:gap-28">
          <div className="w-full md:max-w-xl mt-6">
            <h1 className="text-center sm:text-left text-[58px] md:text-[64px] sm:text-[80px] font-bold leading-tight tracking-tight text-primary-copy ">
              Your <span className="text-[#fd7835]">journey</span> <br />{" "}
              starts here
            </h1>
            <p className="mt-6 md:text-base lg:text-[18px] text-secondary-copy text-center sm:text-left">
              Choose the country you&apos;re traveling to, and we&apos;ll let
              you know if you need a visa.
              <br className="md:hidden block" />
              Then all we need are some
              details for each traveller to get you on your way.
            </p>
            <div className="md:absolute bottom-[29%] left-0 w-full flex justify-center z-20">
              <VisaSelector />
            </div>
            <div className="md:mt-36">
              <Stats />
            </div>
          </div>
          <div className="md:flex hidden relative  items-center justify-center lg:justify-end">
            <div className="flex items-center justify-center relative">
              <div className="absolute -top-20 right-10 z-0">
                <Dots />
              </div>
              <div className="absolute bottom-16 -left-16 z-0">
                <Dots />
              </div>
              <div className="rounded-xl z-10">
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
