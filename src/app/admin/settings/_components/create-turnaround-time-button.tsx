"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createTurnaroundTimeAction } from "@/actions/admin"

interface CreateTurnaroundTimeButtonProps {
  nextIndex: number
}

export function CreateTurnaroundTimeButton({ nextIndex }: CreateTurnaroundTimeButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [turnaroundTimeHours, setTurnaroundTimeHours] = useState("")
  const [fee, setFee] = useState("")

  async function handleCreate() {
    const feeNum = parseFloat(fee)
    const hoursNum = parseInt(turnaroundTimeHours, 10)
    if (!name.trim() || isNaN(feeNum) || isNaN(hoursNum)) return

    await createTurnaroundTimeAction({
      name: name.trim(),
      index: nextIndex,
      turnaround_time_hours: hoursNum,
      fee: feeNum,
    })
    setOpen(false)
    setName("")
    setTurnaroundTimeHours("")
    setFee("")
    router.refresh()
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) {
      setName("")
      setTurnaroundTimeHours("")
      setFee("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          Create
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create turnaround time</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="create-name">Name</Label>
            <Input
              id="create-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard (1-2 days)"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="create-hours">Turnaround time (hours)</Label>
            <Input
              id="create-hours"
              type="number"
              min={1}
              value={turnaroundTimeHours}
              onChange={(e) => setTurnaroundTimeHours(e.target.value)}
              placeholder="e.g. 24 for 1 day"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="create-fee">Fee ($)</Label>
            <Input
              id="create-fee"
              type="number"
              min={0}
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="e.g. 99.00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || !fee || isNaN(parseFloat(fee)) || isNaN(parseInt(turnaroundTimeHours, 10))}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
