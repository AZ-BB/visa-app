"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import type { TurnaroundTime } from "@/lib/admin-types"
import { Button } from "@/components/ui/button"
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

interface FeesTableActionsProps {
  turnaroundTime: TurnaroundTime
}

export function FeesTableActions({ turnaroundTime }: FeesTableActionsProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(turnaroundTime.name)
  const [cost, setCost] = useState(turnaroundTime.cost)

  async function handleSave() {
    await updateTurnaroundTimeAction(turnaroundTime.id, { name, cost })
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1"
      >
        <Pencil className="size-4" />
        Change price
      </Button>
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cost">Cost (£)</Label>
              <Input
                id="cost"
                type="text"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
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
