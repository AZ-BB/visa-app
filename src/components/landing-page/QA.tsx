"use client";

import { ChevronRightIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "@/i18n/navigation";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";
import { useTranslations } from "next-intl";

const FAQ_KEYS = ["faq1", "faq2", "faq3", "faq4", "faq5", "faq6"] as const;

export function QA() {
    const t = useTranslations("landing.faq");
    const tNav = useTranslations("nav");
    return (
        <section id="faqs" className="py-12 md:py-20 mx-auto max-w-7xl space-y-8 md:space-y-10 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 md:items-center md:justify-between">
                <div className="w-full  space-y-4">
                    <h2 className="text-3xl sm:text-3xl md:text-4xl font-bold text-primary-copy text-center sm:text-left">
                        {t("heading")}
                    </h2>
                    <p className="text-secondary-copy text-base text-center sm:text-left">
                        {t("subheading")}
                    </p>
                </div>

                <div className="w-full flex justify-end">
                    <Link href="/contact-us" className="">
                        <Button
                            variant="outline"
                            className="rounded-full sm:w-fit w-full flex justify-between items-center pl-6 pr-4 py-8 group text-base"
                        >
                            <div className="w-9 h-9 sm:hidden">

                            </div>
                            <span>
                                {tNav("contactUs")}
                            </span>
                            <div className="w-9 h-9 rounded-full bg-[#F3F6FC] group-hover:bg-transparent transition-colors duration-100 flex items-center justify-center">
                                <ChevronRightIcon className="size-6" />
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full">
                <Accordion type="single" collapsible className="w-full md:w-1/2 flex flex-col gap-4">
                    {FAQ_KEYS.slice(0, 3).map((key, index) => (
                        <AccordionItem key={key} value={`item-left-${index}`}>
                            <AccordionTrigger className="text-base sm:text-lg md:text-xl cursor-pointer">{t(`${key}Q`)}</AccordionTrigger>
                            <AccordionContent className="text-sm sm:text-base text-secondary-copy">{t(`${key}A`)}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <Accordion type="single" collapsible className="w-full md:w-1/2 flex flex-col gap-4">
                    {FAQ_KEYS.slice(3, 6).map((key, index) => (
                        <AccordionItem key={key} value={`item-right-${index}`}>
                            <AccordionTrigger className="text-base sm:text-lg md:text-xl cursor-pointer">{t(`${key}Q`)}</AccordionTrigger>
                            <AccordionContent className="text-sm sm:text-base text-secondary-copy">{t(`${key}A`)}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
