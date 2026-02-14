import { Button } from "@/components/ui/button";
import ArrowButton from "@/components/ArrowButton";
import Image from "next/image";
import Link from "next/link";
import { getCountryNameFromCode } from "@/lib/contries-name";
import InfoIcon from "@/components/svgs/info";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import TipCard from "@/components/TipCard";

export default async function ApplyPage({ params, searchParams }: { params: Promise<{ country: string }>, searchParams: Promise<{ from: string }> }) {
    const { country } = await params;
    const { from } = await searchParams;

    const nationality = getCountryNameFromCode(from);
    const countryName = getCountryNameFromCode(country);
    const visaTypes = [
        'Tourist visa',
        'Business visa',
    ]
    const selectedVisaType = 'Tourist visa';

    const isSupported = true;
    const isVisaRequired = true;

    if (!isVisaRequired) {
        return (
            <div className="w-full flex flex-col items-center justify-start min-h-screen px-4 sm:px-0">
                <div className="bg-white mt-24 flex flex-col items-center justify-center gap-4 relative pt-24 pb-10 px-10 rounded-lg border border-border-default/40">
                    <Image
                        src="/images/plane.png"
                        alt="Plane"
                        width={360}
                        height={264}
                        className="object-contain absolute -top-[120px]"
                    />

                    <h2 className="text-2xl md:text-4xl font-bold text-center">
                        Good news! You don’t need a visa to
                        <br className="hidden md:block" />
                        travel to {countryName}
                    </h2>

                    <Link href="/">
                        <ArrowButton>
                            Travel somewhere else
                        </ArrowButton>
                    </Link>
                </div>
            </div >
        )
    }

    if (!isSupported) {
        return (
            <div className="w-full flex flex-col items-center justify-start min-h-screen px-4 sm:px-0">
                <div className="bg-red-50 mt-24 flex flex-col items-center justify-center gap-4 pt-10 pb-10 px-10 rounded-lg border border-red-200">
                    <h2 className="text-2xl md:text-4xl font-bold text-center">
                        We currently don&apos;t support this trip
                    </h2>

                    <Link href="/">
                        <ArrowButton>
                            Try somewhere else
                        </ArrowButton>
                    </Link>
                </div>
            </div>
        );
    }

    const hasPreviousApplication = true;

    return (
        <div className="max-w-7xl mx-auto min-h-screen px-6 pt-10 space-y-10">
            <h2 className="text-2xl md:text-4xl font-bold">
                Apply for your {countryName} {'visa-type'}
            </h2>

            {
                hasPreviousApplication && (
                    <div className="bg-[#3CB179] text-white px-5 py-5 rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-bold">
                                Pick up where you left off
                            </h3>
                            <p className="font-normal">
                                Save time and jump back into your previously started application.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant={"outline"}
                                className="border-white text-white bg-light-primary py-6 px-4 rounded-full"
                            >
                                Dissmiss
                            </Button>

                            <ArrowButton variant={"outline"} className="text-sm py-6 pl-4 pr-2 border-border-default hover:text-white" iconContainerClassName="scale-80" >
                                Continue
                            </ArrowButton>
                        </div>
                    </div>
                )

            }

            <div className="flex gap-12">
                <div className="w-2/3 space-y-9">
                    <TipCard>
                        <span>
                            A visa is <span className="font-semibold">required</span> when travelling to {countryName} with a passport from {nationality}.
                        </span>
                    </TipCard>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">
                                Where am I from?
                            </h3>
                            <p className="text-secondary-copy text-base">
                                Must match the nationality of the passport you’ll be travelling with.
                            </p>
                        </div>

                        <CountryDropdown className="py-4" />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">
                            Which visa do you need?
                        </h3>

                        <Select>
                            <SelectTrigger className="py-4" defaultValue={'1'}>
                                <SelectValue placeholder="Select a visa" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Tourist visa</SelectItem>
                                <SelectItem value="2">Business visa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>


                <div className="w-1/3">
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <h3 className="text-xl font-semibold">
                            {countryName} {selectedVisaType}
                        </h3>

                        <Separator className="my-4" />

                        <div className="space-y-5">
                            <div className="flex gap-3 items-center">
                                <div className="size-12 shrink-0 bg-[#FFF2EB] rounded-full flex items-center justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_2035_540)">
                                            <path opacity="0.4" d="M3.00011 6.54842C3.02354 10.8328 4.80011 18.2344 11.7376 21.5531C11.9064 21.6328 12.1032 21.6328 12.2673 21.5531C19.2048 18.2344 20.9814 10.8375 21.0001 6.54842C21.0001 6.31405 20.8548 6.0703 20.5782 5.94843L12.0001 2.31561L3.42198 5.95311C3.14542 6.0703 2.99542 6.31874 3.00011 6.55311V6.54842ZM6.70323 11.2031C7.14386 10.7625 7.85636 10.7625 8.29229 11.2031L10.4954 13.4062L15.7032 8.20311C16.1439 7.76249 16.8564 7.76249 17.2923 8.20311C17.7282 8.64374 17.7329 9.35624 17.2923 9.79217L11.297 15.7969C10.8564 16.2375 10.1439 16.2375 9.70792 15.7969L6.70792 12.7969C6.26729 12.3562 6.26729 11.6437 6.70792 11.2078L6.70323 11.2031Z" fill="#FD7835" />
                                            <path d="M3.4219 5.95313L12 2.31563L20.5781 5.95313C20.8547 6.07031 21.0047 6.31875 21 6.55313C20.9813 10.8375 19.2 18.2391 12.2672 21.5578C12.0985 21.6375 11.9016 21.6375 11.7375 21.5578C4.80002 18.2344 3.02346 10.8375 3.00002 6.54844C3.00002 6.31406 3.14533 6.07031 3.4219 5.94844V5.95313ZM21.4547 3.88125L12.6281 0.135938C12.4313 0.046875 12.2203 0 12 0C11.7797 0 11.5688 0.046875 11.3719 0.135938L2.54533 3.88125C1.51408 4.31719 0.745334 5.33438 0.750021 6.5625C0.773459 11.2125 2.68596 19.7203 10.7625 23.5875C11.5453 23.9625 12.4547 23.9625 13.2375 23.5875C21.3188 19.7203 23.2266 11.2125 23.25 6.5625C23.2547 5.33438 22.486 4.31719 21.4547 3.88125ZM17.2969 9.79688C17.7375 9.35625 17.7375 8.64375 17.2969 8.20781C16.8563 7.77188 16.1438 7.76719 15.7078 8.20781L10.5047 13.4109L8.30158 11.2078C7.86096 10.7672 7.14846 10.7672 6.71252 11.2078C6.27658 11.6484 6.2719 12.3609 6.71252 12.7969L9.71252 15.7969C10.1531 16.2375 10.8656 16.2375 11.3016 15.7969L17.2969 9.79688Z" fill="#FD7835" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_2035_540">
                                                <rect width="24" height="24" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </div>

                                <div className="">
                                    <p className="text-secondary-copy text-sm">
                                        Valid for
                                    </p>

                                    <p className="text-base font-semibold">
                                        {'{x}'} {'{time}'} after issue
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 items-center">
                                <div className="size-12 shrink-0 bg-[#FFF2EB] rounded-full flex items-center justify-center">
                                    <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_2035_548)">
                                            <path opacity="0.4" d="M2.14282 9V21C2.14282 21.4125 2.46425 21.75 2.85711 21.75H17.1428C17.5357 21.75 17.8571 21.4125 17.8571 21V9H2.14282ZM5.31246 14.5781C5.73211 14.1375 6.41068 14.1375 6.82586 14.5781L8.92407 16.7812L13.1651 12.3281C13.5848 11.8875 14.2634 11.8875 14.6785 12.3281C15.0937 12.7687 15.0982 13.4812 14.6785 13.9172L9.68746 19.1719C9.26782 19.6125 8.58925 19.6125 8.17407 19.1719L5.31693 16.1719C4.89729 15.7312 4.89729 15.0188 5.31693 14.5828L5.31246 14.5781Z" fill="#FD7835" />
                                            <path d="M5.71429 0C6.30804 0 6.78571 0.501562 6.78571 1.125V3H13.2143V1.125C13.2143 0.501562 13.692 0 14.2857 0C14.8795 0 15.3571 0.501562 15.3571 1.125V3H17.1429C18.7188 3 20 4.34531 20 6V6.75V9V21C20 22.6547 18.7188 24 17.1429 24H2.85714C1.28125 24 0 22.6547 0 21V9V6.75V6C0 4.34531 1.28125 3 2.85714 3H4.64286V1.125C4.64286 0.501562 5.12054 0 5.71429 0ZM17.8571 9H2.14286V21C2.14286 21.4125 2.46429 21.75 2.85714 21.75H17.1429C17.5357 21.75 17.8571 21.4125 17.8571 21V9ZM14.6875 13.9219L9.6875 19.1719C9.26786 19.6125 8.58929 19.6125 8.17411 19.1719L5.31696 16.1719C4.89732 15.7312 4.89732 15.0188 5.31696 14.5828C5.73661 14.1469 6.41518 14.1422 6.83036 14.5828L8.92857 16.7859L13.1696 12.3328C13.5893 11.8922 14.2679 11.8922 14.683 12.3328C15.0982 12.7734 15.1027 13.4859 14.683 13.9219H14.6875Z" fill="#FD7835" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_2035_548">
                                                <rect width="20" height="24" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </div>

                                <div className="">
                                    <p className="text-secondary-copy text-sm">
                                        Number of entries
                                    </p>

                                    <p className="text-base font-semibold">
                                        {'{number-of-entries}'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 items-center">
                                <div className="size-12 shrink-0 bg-[#FFF2EB] rounded-full flex items-center justify-center">
                                    <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_2035_556)">
                                            <path opacity="0.4" d="M2.03247 8.98945L4.52247 11.7141C4.57872 11.7773 4.66122 11.8125 4.75122 11.8125H9.30372C9.35247 11.8125 9.40122 11.802 9.44247 11.7809L18.8325 7.15781C20.1825 6.49336 21.2587 5.43516 21.9037 4.14141C22.08 3.78633 21.8025 3.375 21.3825 3.375H19.4775C18.8475 3.375 18.225 3.51914 17.6662 3.79336L14.55 5.32266C14.3287 5.43164 14.0662 5.44922 13.83 5.37188L6.86997 3.05508C6.51747 2.93906 6.13497 2.94961 5.78997 3.0832L4.64997 3.52969L9.48372 6.38438C9.75747 6.54609 9.91497 6.83086 9.90372 7.1332C9.89247 7.43555 9.70872 7.70625 9.42372 7.84688L6.11997 9.47109C5.87622 9.59062 5.58747 9.59766 5.33622 9.4957L3.15372 8.58164C3.07122 8.54648 2.97747 8.55 2.89872 8.58867L2.03622 8.99297L2.03247 8.98945Z" fill="#FD7835" />
                                            <path d="M5.79375 3.0797C6.13875 2.94611 6.52125 2.93556 6.87375 3.05157L13.8375 5.37189C14.0738 5.44923 14.3325 5.43165 14.5575 5.32267L17.6737 3.79337C18.2325 3.51915 18.8512 3.37501 19.485 3.37501H21.39C21.81 3.37501 22.0875 3.78282 21.9113 4.14142C21.2663 5.43517 20.1863 6.49689 18.84 7.15782L9.4425 11.7809C9.40125 11.802 9.3525 11.8125 9.30375 11.8125H4.75125C4.665 11.8125 4.57875 11.7774 4.5225 11.7141L2.0325 8.98947L2.895 8.58517C2.97375 8.5465 3.0675 8.5465 3.15 8.57814L5.3325 9.48868C5.58375 9.59415 5.8725 9.58361 6.11625 9.46408L9.42 7.83986C9.705 7.69923 9.88875 7.42853 9.9 7.12618C9.91125 6.82384 9.75375 6.53907 9.48 6.37736L4.65 3.5297L5.79375 3.08321V3.0797ZM7.47375 1.46251C6.70125 1.20587 5.8575 1.22696 5.1 1.52228L3.42375 2.1797C2.3025 2.61915 2.17125 4.06056 3.2025 4.66876L7.2 7.02775L5.66625 7.78009L3.88125 7.03478C3.3075 6.79572 2.65125 6.80978 2.08875 7.07345L2.49 7.82931L2.0925 7.07697L0.885 7.64298C0.01125 8.05079 -0.2175 9.11954 0.41625 9.81564L3.1575 12.8145L3.8175 12.2836L3.1575 12.811C3.555 13.2469 4.14 13.5 4.75125 13.5H9.30375C9.645 13.5 9.97875 13.4227 10.2788 13.275L19.6688 8.65197C21.3675 7.81525 22.725 6.48282 23.535 4.85509C24.27 3.37853 23.1225 1.68751 21.3825 1.68751H19.4775C18.555 1.68751 17.6475 1.89845 16.8337 2.29923L14.0663 3.65626L7.47375 1.46251ZM0.9 16.3125C0.40125 16.3125 0 16.6887 0 17.1563C0 17.6238 0.40125 18 0.9 18H23.1C23.5988 18 24 17.6238 24 17.1563C24 16.6887 23.5988 16.3125 23.1 16.3125H0.9Z" fill="#FD7835" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_2035_556">
                                                <rect width="24" height="18" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </div>

                                <div className="">
                                    <p className="text-secondary-copy text-sm">
                                        Max stay
                                    </p>

                                    <p className="text-base font-semibold">
                                        {'{x}'} {'{time}'} per entry
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full flex items-center justify-center">
                <ArrowButton className="" >
                    Start your application
                </ArrowButton>
            </div>
        </div>
    )
}