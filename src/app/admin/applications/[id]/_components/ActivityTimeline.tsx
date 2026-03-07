import {
  UserPlus,
  RefreshCw,
  RotateCcw,
  FileEdit,
  FilePlus,
  Clock,
} from "lucide-react"
import type { ActivityLogEntry } from "@/actions/applications"

const statusLabels: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
}

function formatDateTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

function getActionIcon(actionType: string) {
  switch (actionType) {
    case "ASSIGNED_ADMIN":
      return <UserPlus className="size-4" />
    case "STATUS_CHANGED":
      return <RefreshCw className="size-4" />
    case "REFUNDED":
      return <RotateCcw className="size-4" />
    case "APPLICATION_EDITED":
      return <FileEdit className="size-4" />
    case "APPLICATION_CREATED":
      return <FilePlus className="size-4" />
    default:
      return <Clock className="size-4" />
  }
}

function getActionLabel(actionType: string): string {
  switch (actionType) {
    case "ASSIGNED_ADMIN":
      return "Assigned admin"
    case "STATUS_CHANGED":
      return "Status changed"
    case "REFUNDED":
      return "Refunded"
    case "APPLICATION_EDITED":
      return "Application edited"
    case "APPLICATION_CREATED":
      return "Application created"
    default:
      return actionType
  }
}

function formatContent(entry: ActivityLogEntry, admins: AdminOption[]): string {
  const { action_type, content } = entry
  const getAdminName = (id: string | null) => {
    if (!id) return "Unassigned"
    const a = admins.find((x) => x.id === id)
    return a ? `${a.first_name} ${a.last_name}` : "Admin"
  }
  switch (action_type) {
    case "ASSIGNED_ADMIN": {
      const from = content.from_admin_id as string | null
      const to = content.to_admin_id as string | null
      return `${getAdminName(from)} → ${getAdminName(to)}`
    }
    case "STATUS_CHANGED": {
      const from = content.from as string
      const to = content.to as string
      const fromLabel = statusLabels[from] ?? from
      const toLabel = statusLabels[to] ?? to
      return `${fromLabel} → ${toLabel}`
    }
    case "REFUNDED": {
      const amountCents = (content.amount_cents as number) ?? 0
      const amount = (amountCents / 100).toFixed(2)
      return `$${amount}`
    }
    case "APPLICATION_EDITED": {
      return (content.summary as string) ?? "Application details updated"
    }
    case "APPLICATION_CREATED": {
      return (content.summary as string) ?? "Application created by client"
    }
    default:
      return typeof content.summary === "string" ? content.summary : ""
  }
}

interface AdminOption {
  id: string
  first_name: string
  last_name: string
}

interface ActivityTimelineProps {
  logs: ActivityLogEntry[]
  admins?: AdminOption[]
}

export function ActivityTimeline({ logs, admins = [] }: ActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-border-default px-5 py-3">
          <Clock className="size-4 text-secondary-copy" />
          <p className="text-sm font-medium text-primary-copy">Activity</p>
        </div>
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-secondary-copy">No activity yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-border-default px-5 py-3">
        <Clock className="size-4 text-secondary-copy" />
        <p className="text-sm font-medium text-primary-copy">Activity</p>
      </div>
      <div className="divide-y divide-border-default/60">
        {logs.map((entry, i) => (
          <div
            key={entry.id}
            className="relative flex gap-4 px-5 py-4"
          >
            {i < logs.length - 1 && (
              <div
                className="absolute left-[29px] top-12 bottom-0 w-px bg-border-default/60"
                aria-hidden
              />
            )}
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {getActionIcon(entry.action_type)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-secondary-copy">
                {formatDateTime(entry.created_at)}
              </p>
              <p className="mt-0.5 text-sm font-medium text-primary-copy">
                {entry.actor_name}
              </p>
              <p className="mt-0.5 text-sm text-primary-copy">
                <span className="font-medium">{getActionLabel(entry.action_type)}</span>
                {formatContent(entry, admins) && (
                  <span className="text-secondary-copy"> — {formatContent(entry, admins)}</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
