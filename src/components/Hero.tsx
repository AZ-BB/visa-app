export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
              Your <span className="text-orange-500">journey</span> starts here
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Choose the country you&apos;re travelling to, and we&apos;ll let you know if you need a visa. Then all we need are some details for each traveller to get you on your way.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Where am I from?
                  </span>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3">
                    <span className="text-lg" aria-hidden>🇬🇧</span>
                    <span className="flex-1 text-gray-900">United Kingdom</span>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <title>Dropdown</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Where am I travelling?
                  </span>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3">
                    <span className="flex-1 text-gray-500">Choose location</span>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <title>Dropdown</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <a
                href="#visa"
                className="whitespace-nowrap rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white transition hover:bg-blue-700"
              >
                Choose your visa &rarr;
              </a>
            </div>
          </div>
          <div className="relative flex items-center justify-center lg:justify-end">
            <div
              className="relative h-64 w-full max-w-md rounded-2xl bg-gray-100 lg:h-80"
              style={{
                backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-xl bg-gray-200/80 px-8 py-12 text-center text-gray-500">
                  Hero image
                  <br />
                  <span className="text-sm">(e.g. traveller with passports)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
