const NAV_LINKS = [
  { label: "Testimonials", href: "#testimonials" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Featured", href: "#featured" },
  { label: "FAQs", href: "#faqs" },
];

export function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a
          href="/"
          className="flex font-bold items-center gap-1 text-[32px] text-gray-800"
          style={{ letterSpacing: "-0.5px" }}
        >
          <span>logo</span>
          <span className="text-orange-500">.</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-secondary-copy transition hover:text-gray-900"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="rounded-[8px] bg-white border border-border-default font-semibold text-primary px-5 py-2.5 text-sm transition hover:bg-blue-700"
        >
          Contact us
        </a>
      </div>
    </header>
  );
}
