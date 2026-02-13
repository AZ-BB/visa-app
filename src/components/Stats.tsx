const STATS = [
  { value: "1,000+", label: "Customers helped" },
  { value: "99%", label: "Approval rate" },
  { value: "24/7", label: "Support" },
];

export function Stats() {
  return (
    <section className="relative border-t border-gray-100 bg-gray-50/50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-[48px] font-bold text-primary-copy md:text-4xl">{stat.value}</div>
              <div className=" text-[16px] text-secondary-copy">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
