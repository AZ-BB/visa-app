"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Clock, ChevronDown } from "lucide-react"
import type { Tables } from "@/database.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateTurnaroundTimeAction } from "@/actions/admin"

type TurnaroundTime = Tables<"turnaround_times">

interface TurnaroundTimeCardProps {
  turnaroundTime: TurnaroundTime
}

function formatHours(hours: number) {
  return `${hours}h`
}

export function TurnaroundTimeCard({ turnaroundTime }: TurnaroundTimeCardProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(turnaroundTime.name)
  const [fee, setFee] = useState(String(turnaroundTime.fee))
  const [turnaroundTimeHours, setTurnaroundTimeHours] = useState(
    String(turnaroundTime.turnaround_time_hours)
  )

  async function handleSave() {
    const feeNum = parseFloat(fee)
    const hoursNum = parseInt(turnaroundTimeHours, 10)
    if (isNaN(feeNum) || isNaN(hoursNum)) return

    await updateTurnaroundTimeAction(turnaroundTime.id, {
      name,
      fee: feeNum,
      turnaround_time_hours: hoursNum,
    })
    setOpen(false)
    router.refresh()
  }

  async function handleStatusChange(disabled: boolean) {
    await updateTurnaroundTimeAction(turnaroundTime.id, { is_disabled: disabled })
    router.refresh()
  }

  return (
    <>
      <Card className="w-full border-border-default bg-white py-0 shadow-sm transition-shadow">
        <CardContent className="flex items-center justify-between gap-4 px-3 py-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="font-bold text-primary-copy text-xl">
              {turnaroundTime.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-secondary-copy">
              <Clock className="size-4 shrink-0" />
              <span className="font-medium">{formatHours(turnaroundTime.turnaround_time_hours)}</span>
            </div>
            <p className="font-bold text-primary-copy">
              ${turnaroundTime.fee.toFixed(2)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={
                    turnaroundTime.is_disabled
                      ? "text-amber-800 border-amber-200 bg-amber-50"
                      : "text-emerald-600 border-emerald-200 bg-emerald-50"
                  }
                >
                  {turnaroundTime.is_disabled ? "Disabled" : "Active"}
                  <ChevronDown className="ml-1 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleStatusChange(false)}
                  disabled={!turnaroundTime.is_disabled}
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(true)}
                  disabled={turnaroundTime.is_disabled}
                >
                  Disabled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setName(turnaroundTime.name)
                setFee(String(turnaroundTime.fee))
                setTurnaroundTimeHours(String(turnaroundTime.turnaround_time_hours))
                setOpen(true)
              }}
              className="gap-2"
            >
              <Pencil className="size-4" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit turnaround time</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard (5–7 days)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hours">Turnaround time (hours)</Label>
              <Input
                id="hours"
                type="number"
                min={1}
                value={turnaroundTimeHours}
                onChange={(e) => setTurnaroundTimeHours(e.target.value)}
                placeholder="e.g. 168 for 7 days"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fee">Fee (£)</Label>
              <Input
                id="fee"
                type="number"
                min={0}
                step="0.01"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
