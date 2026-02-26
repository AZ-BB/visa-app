import ArrowButton from "@/components/ArrowButton";
import Image from "next/image";
import Link from "next/link";
import { getCountryNameFromCode } from "@/lib/contries-name";
import InfoIcon from "@/components/svgs/info";
import { ApplyFormSection } from "./_components/ApplyFormSection";
import { ResumeApplicationBanner } from "./_components/ResumeApplicationBanner";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import TipCard from "@/components/TipCard";
import getVisaSearchResult from "@/actions/visas";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/get-user";

export default async function ApplyPage({ params, searchParams }: { params: Promise<{ country: string }>, searchParams: Promise<{ from: string }> }) {
    const { country } = await params;
    const { from } = await searchParams;


    const supabase = await createSupabaseServerClient();
    const { data: destinationCountry, error: destinationCountryError } = await supabase
        .from("countries")
        .select("*")
        .eq("id", country)
        .single();

    if (!destinationCountry || destinationCountryError) {
        return notFound();
    }

    const isDestinationDisabled = destinationCountry.is_disabled ?? false;

    if (isDestinationDisabled) {
        return (
            <div className="w-full flex flex-col items-center justify-start min-h-screen px-4 sm:px-0">
                <div className="bg-red-50 mt-24 flex flex-col items-center justify-center gap-4 pt-10 pb-10 px-10 rounded-lg border border-red-200">
                    <h2 className="text-2xl md:text-3xl font-bold text-center">
                        We currently don&apos;t support any trips to {destinationCountry.name}
                    </h2>
                </div>
            </div>
        )
    }

    const { data: passportCountry, error: passportCountryError } = await supabase
        .from("countries")
        .select("*")
        .eq("id", from)
        .single();

    if (!passportCountry || passportCountryError) {
        return notFound();
    }

    const { data: visaRules, error: visaRulesError } = await supabase
        .from("visa_rules")
        .select("*")
        .eq("destination_country", destinationCountry.id)
        .eq("nationality", passportCountry.id)
        .single();

    if (!visaRules || visaRulesError) {
        return notFound();
    }

    const isSupported = visaRules.is_supported ?? false;
    const isVisaRequired = visaRules.is_visa_required ?? false;

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
                        travel to {destinationCountry.name}
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

    const { data: products, error: productsError } = await supabase
        .from("products")
        .select(`*,
        visa:visa_types(*)
        `)
        .eq("visa_rule_id", visaRules.id)
        .eq("is_disabled", false);


    console.log("products", products);
    console.log("productsError", productsError);

    const user = await getUser();


    return (
        <div className="max-w-7xl mx-auto min-h-screen px-6 pt-10 space-y-10">
            <ApplyFormSection
                user={user}
                products={products ?? []}
                destinationCountry={destinationCountry}
                passportCountry={passportCountry}
                rules={visaRules}
            />
        </div>
    )
}