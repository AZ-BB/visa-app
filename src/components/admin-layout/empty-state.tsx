import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default bg-bg-light-grey/50 py-12 px-6 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-primary-copy">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-secondary-copy">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
