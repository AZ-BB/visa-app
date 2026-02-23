import { ApplicationFlow } from "./_components/ApplicationFlow";

export default async function ApplicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { country } = await params;
  const { step: stepParam } = await searchParams;
  const raw = stepParam != null ? parseInt(stepParam, 10) : NaN;
  const initialStep = Number.isNaN(raw)
    ? undefined
    : (Math.min(5, Math.max(1, raw)) as 1 | 2 | 3 | 4 | 5);
  return (
    <div className="min-h-screen bg-bg-light-grey">
      <ApplicationFlow country={country} initialStep={initialStep} />
    </div>
  );
}