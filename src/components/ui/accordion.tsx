"use client"

import * as React from "react"
import { ChevronDownIcon, MinusIcon, PlusIcon } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const AccordionVariantContext = React.createContext<"default" | "variant-2">("default")

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className="flex flex-col gap-4"
      {...props}
    />
  )
}

function AccordionItem({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item> & {
  variant?: "default" | "variant-2"
}) {
  return (
    <AccordionVariantContext.Provider value={variant}>
      <AccordionPrimitive.Item
        data-slot="accordion-item"
        data-accordion-variant={variant}
        className={cn(
          "rounded-xl border border-[#e5e7eb] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
          variant === "variant-2" &&
          "rounded-xl border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
          className
        )}
        {...props}
      />
    </AccordionVariantContext.Provider>
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  const variant = React.useContext(AccordionVariantContext)
  const isVariant2 = variant === "variant-2"

  if (isVariant2) {
    return (
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          data-slot="accordion-trigger"
          className={cn(
            "focus-visible:border-ring focus-visible:ring-ring/50 group flex flex-1 items-center justify-between gap-4 rounded-t-xl px-5 py-4 text-left font-bold text-[#1f2937] transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
            "bg-[#F3F6FC] data-[state=open]:rounded-t-xl data-[state=closed]:rounded-b-xl",
            className
          )}
          {...props}
        >
          <span className="flex-1">{children}</span>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white border border-border-default text-[#1f2937] transition-transform group-data-[state=open]:rotate-180"
            aria-hidden
          >
            <ChevronDownIcon className="size-5 pointer-events-none" />
          </span>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    )
  }

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 group flex flex-1 items-center justify-between gap-4 px-5 py-4 text-left font-bold text-[#111827] transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 data-[state=open]:rounded-t-xl",
          className
        )}
        {...props}
      >
        {children}
        <PlusIcon className="text-muted-foreground pointer-events-none size-6 shrink-0 group-data-[state=open]:hidden" />
        <MinusIcon className="text-muted-foreground pointer-events-none size-6 shrink-0 hidden group-data-[state=open]:block" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  const variant = React.useContext(AccordionVariantContext)
  const isVariant2 = variant === "variant-2"

  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div
        className={cn(
          "px-5 pb-5 pt-0 text-[#6b7280] font-normal leading-relaxed",
          isVariant2 && "bg-white rounded-b-xl",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
