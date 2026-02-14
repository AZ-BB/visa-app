import { Button } from "@/components/ui/button";
import ArrowButton from "@/components/ArrowButton";
import Image from "next/image";

export default async function ApplyPage({ params, searchParams }: { params: Promise<{ country: string }>, searchParams: Promise<{ from: string }> }) {
    const { country } = await params;
    const { from } = await searchParams;

    const isSupported = true;
    const isVisaRequired = false;

    if (!isVisaRequired) {
        return (
            <div className="w-full flex flex-col items-center justify-center">
                <div className="bg-white mt-24 flex flex-col items-center justify-center gap-4 relative min-h-[]">
                    <Image
                        src="/images/plane.png"
                        alt="Plane"
                        width={360}
                        height={264}
                        className="object-contain absolute -top-[100px]"
                    />

                    <h2 className="text-3xl font-bold text-center">
                        Good news! You don’t need a visa to travel to {country}
                    </h2>

                    <ArrowButton>
                        Travel somewhere else
                    </ArrowButton>
                </div>
            </div>
        )
    }

    if (!isSupported) {

    }

    return (
        <div>
            <h1>Start Page</h1>
        </div>
    )
}