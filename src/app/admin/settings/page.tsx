import { fetchTurnaroundTimes } from "@/actions/admin"
import { PageHeader } from "@/components/admin-layout/page-header"
import { CreateTurnaroundTimeButton } from "./_components/create-turnaround-time-button"
import { TurnaroundTimeCard } from "./_components/turnaround-time-card"

export default async function SettingsPage() {
  const turnaroundTimes = await fetchTurnaroundTimes()

  return (
    <main className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Turnaround Plans & fees"
        description="Manage turnaround times and their prices."
        actions={<CreateTurnaroundTimeButton nextIndex={turnaroundTimes.length} />}
      />
      {turnaroundTimes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border-default bg-white px-6 py-20 text-center shadow-sm">
          <p className="text-sm text-secondary-copy">
            No turnaround times configured.
          </p>
        </div>
      ) : (
        <div className="flex max-w-2xl flex-col gap-2">
          {turnaroundTimes.map((tt) => (
            <TurnaroundTimeCard key={tt.id} turnaroundTime={tt} />
          ))}
        </div>
      )}
    </main>
  )
}
