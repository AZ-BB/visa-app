import { getUser } from "@/lib/get-user";
import { ApplicationFlow } from "./_components/ApplicationFlow";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { notFound } from "next/navigation";
import ArrowButton from "@/components/ArrowButton";
import { Link } from "@/i18n/navigation";
import { getTurnaroundTimes } from "@/actions/turnaround-times";
import { getTranslations } from "next-intl/server";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { country } = await params;
  const t = await getTranslations("application.page");

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
            {t("notSupportedDestination", { destination: destinationCountry.name })}
          </h2>

          <Link href="/">
            <ArrowButton>
              {t("tryAgain")}
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
            {t("technicalIssues")}
          </h2>

          <Link href="/">
            <ArrowButton>
              {t("tryAgain")}
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