import { getUser } from "@/lib/get-user";
import { ApplicationFlow } from "./_components/ApplicationFlow";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { notFound } from "next/navigation";
import ArrowButton from "@/components/ArrowButton";
import Link from "next/link";

export default async function ApplicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { country } = await params;

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

          <Link href="/">
            <ArrowButton>
              Try somewhere else
            </ArrowButton>
          </Link>
        </div>
      </div>
    )
  }

  const { step: stepParam } = await searchParams;
  const raw = stepParam != null ? parseInt(stepParam, 10) : NaN;
  const initialStep = Number.isNaN(raw) ? undefined : (Math.min(5, Math.max(1, raw)) as 1 | 2 | 3 | 4 | 5);

  const user = await getUser();

  return (
    <div className="min-h-screen bg-bg-light-grey">
      <ApplicationFlow
        country={country}
        initialStep={initialStep}
      />
    </div>
  );
}