import type * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 border border-border-default px-6 py-4 rounded-2xl shadow-[0px_2px_4px_0px_#0000000A] text-primary-copy text-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow duration-200",
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive placeholder:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
