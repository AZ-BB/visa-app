import { ApplicationFlow } from "./_components/ApplicationFlow";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  return (
    <div className="min-h-screen bg-bg-light-grey">
      <ApplicationFlow country={country} />
    </div>
  );
}