import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
    const t = await getTranslations("apply");
    return (
        <div className="flex flex-col items-center justify-start h-screen pt-20">
            <h1 className="text-4xl font-bold text-primary-copy">{t("notFoundTitle")}</h1>
            <p className="text-secondary-copy text-lg">{t("notFoundDescription")}</p>
            <Link href="/" className="text-primary hover:underline hover:text-primary-dark transition-colors">{t("goBackHome")}</Link>
        </div>
    )
}