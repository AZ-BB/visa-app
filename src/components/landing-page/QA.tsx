import { ChevronRightIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";

const faqs = [
    {
        id: 1,
        question: "How do I know if I need a visa for my trip?",
        answer:
            "Select your country of origin and your destination on our homepage. We'll instantly check the visa requirements for your trip. If a visa is needed, we'll guide you through the application process step by step.",
    },
    {
        id: 2,
        question: "How long does the visa application process take?",
        answer:
            "Processing times vary by destination and visa type. Most e-Visas (e.g. ESTA, ETA) are processed within 24–72 hours. We offer different turnaround options so you can choose the speed that suits your travel plans.",
    },
    {
        id: 3,
        question: "What documents do I need to apply?",
        answer:
            "Requirements depend on your destination. Typically you'll need a valid passport, travel details, and personal information. We'll tell you exactly what's required for your specific visa before you start your application.",
    },
    {
        id: 4,
        question: "Can I apply for multiple travellers at once?",
        answer:
            "Yes. When a visa is required, you can add all travellers in your group to a single application. We'll collect the necessary details for each person and process them together for your convenience.",
    },
    {
        id: 5,
        question: "What if my application is rejected?",
        answer:
            "We have a 99% approval rate. If an application is unsuccessful, we'll explain the reason and advise on next steps. In most cases, reapplying with corrected information resolves the issue.",
    },
    {
        id: 6,
        question: "Is my payment secure?",
        answer:
            "Absolutely. We use secure payment processing and never store your card details. You'll see a clear breakdown of our service fee and any government fees before you pay.",
    },
];

export function QA() {
    return (
        <section id="faqs" className="py-12 md:py-20 mx-auto max-w-7xl space-y-8 md:space-y-10 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 md:items-center md:justify-between">
                <div className="w-full  space-y-4">
                    <h2 className="text-3xl sm:text-3xl md:text-4xl font-bold text-primary-copy text-center sm:text-left">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-secondary-copy text-base text-center sm:text-left">
                        Find the answers to our commonly asked questions. If you still need help, get in touch and we’ll be happy to assist.
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
                                Contact us
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
                    {faqs.slice(0, 3).map((faq, index) => (
                        <AccordionItem key={faq.id} value={`item-left-${index}`}>
                            <AccordionTrigger className="text-base sm:text-lg md:text-xl cursor-pointer">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-sm sm:text-base text-secondary-copy">{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <Accordion type="single" collapsible className="w-full md:w-1/2 flex flex-col gap-4">
                    {faqs.slice(3, 6).map((faq, index) => (
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