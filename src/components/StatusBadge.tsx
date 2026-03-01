import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
    NOT_STARTED: "Not Started",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
};

const STATUS_STYLES: Record<string, string> = {
    NOT_STARTED: "bg-slate-100 text-slate-700 border-2 border-slate-200",
    IN_PROGRESS: "bg-amber-100 text-amber-800 border-2 border-amber-200",
    COMPLETED: "bg-emerald-100 text-emerald-800 border-2 border-emerald-200",
    REJECTED: "bg-red-100 text-red-800 border-2 border-red-200",
};

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const label = STATUS_LABELS[status] ?? status;
    const style = STATUS_STYLES[status] ?? STATUS_STYLES.NOT_STARTED;

    return (
        <span
            className={cn(
                "rounded-xl px-1 py-1 text-sm font-bold w-fit shrink-0 sm:px-2 sm:py-1.5 sm:text-lg",
                style,
                className
            )}
        >
            {label}
        </span>
    );
}
