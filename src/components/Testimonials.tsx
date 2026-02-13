const TESTIMONIAL_TEXT =
  "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.";

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-bold text-gray-900 md:text-4xl">
          How we&apos;ve helped people
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
            >
              <span className="text-4xl font-serif text-gray-300">&ldquo;</span>
              <p className="mt-2 text-gray-600">{TESTIMONIAL_TEXT}</p>
              <div className="mt-6 flex items-center gap-2">
                <div className="h-8 w-1 rounded-full bg-orange-500" />
                <span className="font-medium text-gray-900">Customer</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
