import { getTranslations } from "next-intl/server";

export default async function Terms() {
    const t = await getTranslations("terms");

    return (
        <main className="min-h-screen bg-bg-light-grey pt-16 flex justify-center items-start">
            <div className="max-w-3xl space-y-10 px-6 sm:px-0">
                <h2 className="text-4xl font-bold text-primary-copy">
                    {t("title")}
                </h2>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-primary-copy">
                        {t("introduction")}
                    </h3>

                    <p className="text-secondary-copy text-lg">
                        {t("introductionText")}
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-primary-copy">
                        {t("userResponsibilities")}
                    </h3>

                    <p className="text-secondary-copy text-lg">
                        {t("userResponsibilitiesText")}
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-primary-copy">
                        {t("limitationOfLiability")}
                    </h3>

                    <p className="text-secondary-copy text-lg">
                        {t("limitationOfLiabilityText")}
                    </p>
                </section>
            </div>
        </main>
    );
}