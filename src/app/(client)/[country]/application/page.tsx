import { getUser } from "@/lib/get-user";
import { ApplicationFlow } from "./_components/ApplicationFlow";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { notFound } from "next/navigation";
import ArrowButton from "@/components/ArrowButton";
import Link from "next/link";
import { getTurnaroundTimes } from "@/actions/turnaround-times";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ country: string }>;
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

  const user = await getUser();

  const { data: turnaroundTimes, status: turnaroundTimesStatus } = await getTurnaroundTimes();

  if (!turnaroundTimes || !turnaroundTimesStatus) {
    return (
      <div className="w-full flex flex-col items-center justify-start min-h-screen px-4 sm:px-0">
        <div className="bg-red-50 mt-24 flex flex-col items-center justify-center gap-4 pt-10 pb-10 px-10 rounded-lg border border-red-200">
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            We are currently experiencing technical issues. Please try again later.
          </h2>

          <Link href="/">
            <ArrowButton>
              Try again
            </ArrowButton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-light-grey">
      <ApplicationFlow
        country={country}
        turnaroundTimes={turnaroundTimes}
        isAuthenticated={user != null}
      />
    </div>
  );
}