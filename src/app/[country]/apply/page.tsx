import ArrowButton from "@/components/ArrowButton";
import Image from "next/image";
import Link from "next/link";
import { getCountryNameFromCode } from "@/lib/contries-name";
import InfoIcon from "@/components/svgs/info";
import { ApplyFormSection } from "./_components/ApplyFormSection";
import { ResumeApplicationBanner } from "./_components/ResumeApplicationBanner";

export default async function ApplyPage({ params, searchParams }: { params: Promise<{ country: string }>, searchParams: Promise<{ from: string }> }) {
    const { country } = await params;
    const { from } = await searchParams;

    const nationality = getCountryNameFromCode(from);
    const countryName = getCountryNameFromCode(country);
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

    return (
        <div className="max-w-7xl mx-auto min-h-screen px-6 pt-10 space-y-10">
            <h2 className="text-2xl md:text-4xl font-bold">
                Apply for your {countryName} {'visa-type'}
            </h2>

            <ResumeApplicationBanner />

            <div className="border-2 border-primary/75 rounded-2xl p-5 text-base flex items-start gap-2 shadow-sm">
                <InfoIcon className="size-5 fill-primary mt-0.5" />
                <span>
                    A visa is <span className="font-semibold">required</span> when travelling to {countryName} with a passport from {nationality}.
                </span>
            </div>

            <ApplyFormSection
                country={country}
                countryName={countryName}
                initialFrom={from}
            />
        </div>
    )
}