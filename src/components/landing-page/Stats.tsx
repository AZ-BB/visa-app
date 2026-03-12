import { getTranslations } from "next-intl/server";

const STAT_KEYS = ["customersHelped", "approvalRate", "support"] as const;
const STAT_VALUES = ["1,000+", "99%", "24/7"] as const;

export async function Stats() {
  const t = await getTranslations("landing.stats");
  return (
    <section className="relative md:py-16 py-10">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-center">
        <div className="grid gap-6 md:gap-10 grid-cols-1 md:grid-cols-3">
          {STAT_KEYS.map((key, i) => (
            <div key={key}>
              <div className="text-[48px] font-bold text-primary-copy md:text-4xl text-center md:text-left">{STAT_VALUES[i]}</div>
              <div className=" text-[16px] text-secondary-copy text-center md:text-left">{t(key)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
