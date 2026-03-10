"use client"
import { CountryDropdown } from "@/components/ui/country-dropdown"
import { Tables } from "@/database.types"
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import ArrowButton from "@/components/ArrowButton";
import Link from "next/link";

export function SelectAnotherCountry({
    destinationCountry,
    passportCountry,
}: {
    destinationCountry: Tables<"countries">
    passportCountry: Tables<"countries">
}) {
    const router = useRouter();

    return (
        <div className="max-w-7xl mx-auto min-h-screen pb-10 sm:pb-0 px-5 md:px-6 pt-6 md:pt-10 space-y-6 md:space-y-10">
            <h2 className="text-2xl md:text-4xl font-bold">
                Apply for your visa to {destinationCountry.name}
            </h2>

            <p>
                A visa is mandatory for {passportCountry.name} passport holders traveling to {destinationCountry.name}. Currently, VisaPro does not provide it.
            </p>
            <div
                className={cn(
                    "grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 items-start",
                )}
            >
                <div className="space-y-6 md:space-y-8 order-1 md:col-span-2 md:col-start-1 md:row-start-1">

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">Where am I from?</h3>
                            <p className="text-secondary-copy text-base">
                                Must match the nationality of the passport you&apos;ll be
                                travelling with.
                            </p>
                        </div>
                        <CountryDropdown
                            className="py-4"
                            value={passportCountry.id}
                            onValueChange={(value) => router.push(`/${destinationCountry.id}/apply?from=${value}`)}
                            placeholder="Choose nationality"
                        />
                    </div>

                </div>
            </div>

            <div className="w-full flex items-center justify-center">
                <Link href="/" className="w-fit">
                    <ArrowButton className="sm:text-base">
                        Check other destinations
                    </ArrowButton>
                </Link>
            </div>
        </div>
    )
}