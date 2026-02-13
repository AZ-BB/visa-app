import { ChevronRightIcon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion";

const faqs = [
    {
        id: 1,
        question: "{question}",
        answer:
            "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    },
    {
        id: 2,
        question: "{question}",
        answer:
            "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    },
    {
        id: 3,
        question: "{question}",
        answer:
            "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    },
];

export function QA() {
    return (
        <section id="qa" className="py-12 md:py-20 mx-auto max-w-7xl space-y-8 md:space-y-10 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 md:items-center md:justify-between">
                <div className="w-full  space-y-4">
                    <h2 className="text-3xl sm:text-3xl md:text-4xl font-bold text-primary-copy">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-secondary-copy text-base">
                        Find the answers to our commonly asked questions. If you still need help, get in touch and we’ll be happy to assist.
                    </p>
                </div>

                <Link href="/contact-us" className="w-full flex justify-end">
                    <Button
                        variant="outline"
                        className="rounded-full pl-6 pr-4 py-3 group text-base"
                    >
                        Contact us
                        <div className="w-9 h-9 rounded-full bg-[#F3F6FC] group-hover:bg-transparent transition-colors duration-100 flex items-center justify-center">
                            <ChevronRightIcon className="size-6" />
                        </div>
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full">
                <Accordion type="single" collapsible className="w-full md:w-1/2 flex flex-col gap-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={faq.id} value={`item-left-${index}`}>
                            <AccordionTrigger className="text-base sm:text-lg md:text-xl cursor-pointer">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-sm sm:text-base text-secondary-copy">{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <Accordion type="single" collapsible className="w-full md:w-1/2 flex flex-col gap-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={faq.id} value={`item-right-${index}`}>
                            <AccordionTrigger className="text-base sm:text-lg md:text-xl cursor-pointer">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-sm sm:text-base text-secondary-copy">{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}