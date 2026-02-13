const STATS = [
  { value: "1,000+", label: "Customers helped" },
  { value: "99%", label: "Approval rate" },
  { value: "24/7", label: "Support" },
];

export function Stats() {
  return (
    <section className="relative md:py-16 py-10">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-center">
        <div className="grid gap-6 md:gap-10 grid-cols-1 md:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-[48px] font-bold text-primary-copy md:text-4xl text-center md:text-left">{stat.value}</div>
              <div className=" text-[16px] text-secondary-copy text-center md:text-left">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
