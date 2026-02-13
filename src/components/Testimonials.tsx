import { Qoutes } from "./svgs/qoutes";

const TESTIMONIAL_TEXT =
  "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.";

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-bold text-gray-900 md:text-4xl mt-10">
          How we&apos;ve helped people
        </h2>
        <div className="mt-24 grid gap-16 md:gap-8  md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl relative border border-border-default/50 bg-white p-8 shadow-sm"
            >
              <div className="flex justify-center absolute -top-10 left-18 -translate-x-1/2">
              <Qoutes />
              </div>
              <p className="mt-2 text-primary-copy text-[18px]">{TESTIMONIAL_TEXT}</p>
              <div className="mt-6 flex items-center gap-2">
                <div className="h-8 w-1  bg-orange-500" />
                <span className="text-[18px] font-semibold text-primary-copy">Customer</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
