import type * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full bg-white min-w-0 border border-border-default px-6 py-4 rounded-2xl shadow-[0px_2px_4px_0px_#0000000A] text-primary-copy text-base focus:outline-none focus:ring-2 focus:ring-primary transition-shadow duration-200",
        "placeholder:text-muted-foreground flex field-sizing-content min-h-16 disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive placeholder:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
