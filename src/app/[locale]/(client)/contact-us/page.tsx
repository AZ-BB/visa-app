import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function ContactUs() {
    const t = await getTranslations("contactUs");
    const tForm = await getTranslations("contactUs.form");

    return (
        <div className="min-h-screen max-w-7xl mx-auto flex flex-col sm:flex-row gap-10 pt-16 px-6 sm:px-0 scale-95">

            <div className="w-full sm:w-1/2 space-y-10">
                <section className="space-y-4">
                    <h2 className="text-4xl font-bold text-primary-copy">
                        {t("title")}
                    </h2>

                    <p className="text-secondary-copy text-lg">
                        {t("intro")}
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-secondary-copy">
                        {t("phone")}
                    </h3>

                    <p className="text-primary text-xl font-bold">
                        0800 00 10 66
                    </p>
                </section>

                <section className="space-y-4">

                    <h3 className="text-xl font-bold text-secondary-copy">
                        {t("registeredAddress")}
                    </h3>

                    <p className="text-primary text-xl font-bold whitespace-pre-line">
                        {t("address")}
                    </p>
                </section>
            </div>


            <div className="w-full sm:w-1/2">
                <form className="space-y-5">
                    <section className="flex flex-col gap-2">
                        <Label htmlFor="name">{tForm("name")}</Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder={tForm("namePlaceholder")}
                        />
                    </section>

                    <section className="flex flex-col gap-2">
                        <Label htmlFor="email">{tForm("email")}</Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder={tForm("emailPlaceholder")}
                        />
                    </section>

                    <section className="flex flex-col gap-2">
                        <Label htmlFor="phone">{tForm("phone")} <span className="text-secondary-copy text-base italic font-normal">{tForm("phoneOptional")}</span></Label>
                        <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder={tForm("phonePlaceholder")}
                        />
                    </section>

                    <section className="flex flex-col gap-2">
                        <Label htmlFor="subject">{tForm("subject")}</Label>
                        <Input
                            type="text"
                            id="subject"
                            name="subject"
                            required
                            placeholder={tForm("subjectPlaceholder")}
                        />
                    </section>

                    <section className="flex flex-col gap-2">
                        <Label htmlFor="message">{tForm("message")}</Label>
                        <Textarea
                            id="message"
                            name="message"
                            required
                            placeholder={tForm("messagePlaceholder")}
                            className="resize-none h-[150px] overflow-y-auto"
                            rows={5}
                        />
                    </section>

                    <section className="w-full flex justify-end">
                        <Button
                            className="flex gap-3 group items-center pl-6 pr-4 py-8 rounded-full text-lg"
                        >
                            {tForm("sendEmail")}
                            <div className="w-9 h-9 rounded-full bg-[#0A8EFF] group-hover:bg-[#0A8EFF]/10 transition-colors duration-200 flex items-center justify-center">
                                <ChevronRightIcon className="size-6" />
                            </div>
                        </Button>
                    </section>
                </form>
            </div>
        </div>
    );
}
