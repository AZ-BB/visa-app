import { cn } from "@/lib/utils"
import { ApplicationStatus } from "@/enums"

const statusConfig: Record<
    ApplicationStatus,
    { label: string; className: string }
> = {
    [ApplicationStatus.NOT_STARTED]: {
        label: "Not Started",
        className: "bg-gray-500/20 text-black border-gray-500/50",
    },
    [ApplicationStatus.IN_PROGRESS]: {
        label: "In Progress",
        className: "bg-amber-100 text-black border-amber-500",
    },
    [ApplicationStatus.COMPLETED]: {
        label: "Completed",
        className: "bg-emerald-100 text-black border-emerald-500",
    },
    [ApplicationStatus.REJECTED]: {
        label: "Rejected",
        className: "bg-red-100 text-black border-red-500",
    },
}

interface ApplicationStatusBadgeProps {
    status: ApplicationStatus
    className?: string
}

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
    const config = statusConfig[status]
    return (
        <span
            className={cn(
                "inline-flex text-sm font-semibold items-center px-2.5 py-0.5 rounded-lg border-2 opacity-75",
                config.className,
                className
            )}
        >
            {config.label}
        </span>
    )
}
