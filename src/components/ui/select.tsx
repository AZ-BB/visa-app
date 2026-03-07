"use client"

import * as React from "react"
import { useCallback, useEffect, useLayoutEffect } from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { Popover } from "radix-ui"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Context & Types
// ---------------------------------------------------------------------------

type SelectContextValue = {
  value: string | undefined
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  disabled?: boolean
  items: { value: string; content: React.ReactNode }[]
  setItems: React.Dispatch<React.SetStateAction<{ value: string; content: React.ReactNode }[]>>
  highlightIndex: number
  setHighlightIndex: React.Dispatch<React.SetStateAction<number>>
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) {
    throw new Error("Select components must be used within a Select")
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Select (Root)
// ---------------------------------------------------------------------------

function Select({
  value,
  onValueChange,
  disabled,
  children,
}: React.ComponentProps<"div"> & {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [highlightIndex, setHighlightIndex] = React.useState(0)
  const [items, setItems] = React.useState<{ value: string; content: React.ReactNode }[]>([])

  const ctx: SelectContextValue = {
    value,
    onValueChange: onValueChange ?? (() => { }),
    open,
    setOpen,
    disabled,
    items,
    setItems,
    highlightIndex,
    setHighlightIndex,
  }

  return (
    <SelectContext.Provider value={ctx}>
      <Popover.Root open={open} onOpenChange={setOpen} data-slot="select">
        {children}
      </Popover.Root>
    </SelectContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// SelectTrigger
// ---------------------------------------------------------------------------

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<"button"> & {
  size?: "sm" | "default"
}) {
  const { value, open, disabled } = useSelectContext()

  return (
    <Popover.Trigger asChild>
      <button
        type="button"
        data-slot="select-trigger"
        data-size={size}
        disabled={disabled}
        className={cn(
          "h-auto min-h-12 w-full rounded-2xl border border-[#DAE0E5] bg-white px-4 py-2.5 shadow-[0px_2px_4px_0px_#0000000A]",
          "flex items-center justify-between gap-3 text-base text-primary-copy text-left whitespace-nowrap",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0",
          "hover:border-gray-300 transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[size=sm]:min-h-10",
          "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          !value && "text-secondary-copy",
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        {...props}
      >
        <span data-slot="select-value" className="flex min-w-0 items-center gap-2 line-clamp-1">
          {children}
        </span>
        <ChevronDownIcon className="size-5 shrink-0 text-primary-copy" />
      </button>
    </Popover.Trigger>
  )
}
SelectTrigger.displayName = "SelectTrigger"

// ---------------------------------------------------------------------------
// SelectValue
// ---------------------------------------------------------------------------

function SelectValue({
  placeholder,
  children,
}: {
  placeholder?: React.ReactNode
  children?: React.ReactNode
}) {
  const { value, items } = useSelectContext()
  const selectedItem = value ? items.find((i) => i.value === value) : null
  const display = children ?? selectedItem?.content ?? placeholder
  return <>{display}</>
}
SelectValue.displayName = "SelectValue"

// ---------------------------------------------------------------------------
// SelectContent
// ---------------------------------------------------------------------------

function collectSelectItems(
  children: React.ReactNode,
  SelectItemComponent: React.ComponentType<{ value: string; children?: React.ReactNode }>,
  SelectGroupComponent: React.ComponentType<{ children?: React.ReactNode }>
): { value: string; content: React.ReactNode }[] {
  const items: { value: string; content: React.ReactNode }[] = []
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === SelectItemComponent) {
      const { value, children: itemChildren } = child.props as { value?: string; children?: React.ReactNode }
      if (value !== undefined) {
        items.push({ value, content: itemChildren })
      }
    } else if (React.isValidElement(child) && child.type === SelectGroupComponent) {
      const groupItems = collectSelectItems(
        (child.props as { children?: React.ReactNode }).children,
        SelectItemComponent,
        SelectGroupComponent
      )
      items.push(...groupItems)
    }
  })
  return items
}

function injectItemIndices(
  children: React.ReactNode,
  SelectItemComponent: React.ComponentType<{ value: string; index?: number; children?: React.ReactNode }>,
  SelectGroupComponent: React.ComponentType<{ children?: React.ReactNode }>,
  indexRef: { current: number }
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === SelectItemComponent) {
      const { value } = child.props as { value?: string }
      if (value !== undefined) {
        const idx = indexRef.current++
        return React.cloneElement(child, { index: idx } as { index: number })
      }
    }
    if (React.isValidElement(child) && child.type === SelectGroupComponent) {
      return React.cloneElement(child, {
        children: injectItemIndices(
          (child.props as { children?: React.ReactNode }).children,
          SelectItemComponent,
          SelectGroupComponent,
          indexRef
        ),
      } as { children: React.ReactNode })
    }
    if (React.isValidElement(child) && child.type === React.Fragment) {
      return React.cloneElement(child, {
        children: injectItemIndices(
          (child.props as { children?: React.ReactNode }).children,
          SelectItemComponent,
          SelectGroupComponent,
          indexRef
        ),
      } as { children: React.ReactNode })
    }
    return child
  })
}

function getSearchableText(content: React.ReactNode): string {
  if (typeof content === "string") return content
  if (typeof content === "number") return String(content)
  if (React.isValidElement(content)) {
    const children = (content.props as { children?: React.ReactNode }).children
    if (typeof children === "string") return children
  }
  return ""
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "start",
  sideOffset = 4,
  isContentMenuFullWidth = true,
  enableSearch = false,
  searchPlaceholder = "Search...",
  ...props
}: React.ComponentProps<"div"> & {
  position?: "item-aligned" | "popper"
  align?: "start" | "center" | "end"
  sideOffset?: number
  isContentMenuFullWidth?: boolean
  enableSearch?: boolean
  searchPlaceholder?: string
}) {
  const {
    open,
    setOpen,
    onValueChange,
    items,
    setItems,
    highlightIndex,
    setHighlightIndex,
  } = useSelectContext()

  const [search, setSearch] = React.useState("")
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const collectedItems = React.useMemo(
    () => collectSelectItems(children, SelectItem, SelectGroup),
    [children]
  )

  const filteredItems = React.useMemo(() => {
    if (!enableSearch || !search.trim()) return collectedItems
    const q = search.trim().toLowerCase()
    return collectedItems.filter(
      (item) =>
        item.value.toLowerCase().includes(q) ||
        getSearchableText(item.content).toLowerCase().includes(q)
    )
  }, [collectedItems, enableSearch, search])

  useLayoutEffect(() => {
    setItems(collectedItems)
  }, [collectedItems, setItems])

  useEffect(() => {
    if (open) {
      setSearch("")
      setHighlightIndex(0)
      if (enableSearch) {
        setTimeout(() => searchInputRef.current?.focus(), 0)
      }
    }
  }, [open, enableSearch, setHighlightIndex])

  useEffect(() => {
    if (open && enableSearch) {
      setHighlightIndex(0)
    }
  }, [search, open, enableSearch, setHighlightIndex])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlightIndex((i: number) => (i < filteredItems.length - 1 ? i + 1 : i))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlightIndex((i: number) => (i > 0 ? i - 1 : 0))
      } else if (e.key === "Enter" && filteredItems[highlightIndex]) {
        e.preventDefault()
        onValueChange(filteredItems[highlightIndex].value)
        setOpen(false)
      } else if (e.key === "Escape") {
        setOpen(false)
      }
    },
    [filteredItems, highlightIndex, onValueChange, setOpen]
  )

  const contentBody = enableSearch ? (
    <>
      <Input
        ref={searchInputRef}
        type="text"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2 h-10 rounded-lg border-gray-200 px-3 py-2 text-sm"
        aria-label="Search options"
      />
      {filteredItems.length === 0 ? (
        <div className="py-4 text-center text-sm text-secondary-copy">
          No results found
        </div>
      ) : (
        <div className="rounded-lg">
          {filteredItems.map((item, idx) => (
            <SelectItem key={item.value} value={item.value} index={idx}>
              {item.content}
            </SelectItem>
          ))}
        </div>
      )}
    </>
  ) : (
    injectItemIndices(children, SelectItem, SelectGroup, { current: 0 })
  )

  return (
    <Popover.Portal>
      <Popover.Content
        onWheel={(e) => {
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          e.stopPropagation();
        }}
        data-slot="select-content"
        sideOffset={sideOffset}
        align={align}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative z-50 max-h-[var(--radix-popover-content-available-height,300px)] overflow-x-hidden overflow-y-auto",
          !isContentMenuFullWidth && "min-w-[8rem]",
          "rounded-xl border border-[#DAE0E5]/50 bg-white shadow-lg focus:outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        style={
          position === "popper" || isContentMenuFullWidth
            ? { width: "var(--radix-popover-trigger-width)", minWidth: "var(--radix-popover-trigger-width)" }
            : undefined
        }
        {...props}
      >
        <div
          className={cn(
            "p-2 rounded-lg",
            (position === "popper" || isContentMenuFullWidth) && "w-full min-w-[var(--radix-popover-trigger-width)]"
          )}
        >
          {contentBody}
        </div>
      </Popover.Content>
    </Popover.Portal>
  )
}

// ---------------------------------------------------------------------------
// SelectGroup
// ---------------------------------------------------------------------------

function SelectGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="select-group" className={cn(className)} {...props} />
}

// ---------------------------------------------------------------------------
// SelectLabel
// ---------------------------------------------------------------------------

function SelectLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-label"
      className={cn("text-secondary-copy px-3 py-2 text-sm", className)}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// SelectItem
// ---------------------------------------------------------------------------

function SelectItem({
  className,
  children,
  value,
  index = -1,
  disabled,
  ...props
}: React.ComponentProps<"button"> & {
  value: string
  index?: number
}) {
  const { value: selectedValue, onValueChange, setOpen, highlightIndex, setHighlightIndex } = useSelectContext()

  const isSelected = selectedValue === value
  const isHighlighted = index >= 0 && index === highlightIndex

  const handleSelect = () => {
    if (disabled) return
    onValueChange(value)
    setOpen(false)
  }

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      data-slot="select-item"
      disabled={disabled}
      onClick={handleSelect}
      onMouseEnter={() => setHighlightIndex(index)}
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 pr-8 text-left text-base text-primary-copy transition-colors outline-none select-none",
        "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
        isHighlighted && "bg-gray-100",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-3.5 items-center justify-center"
      >
        {isSelected && <CheckIcon className="size-4 text-primary-copy" />}
      </span>
      <span>{children}</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// SelectSeparator
// ---------------------------------------------------------------------------

function SelectSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
