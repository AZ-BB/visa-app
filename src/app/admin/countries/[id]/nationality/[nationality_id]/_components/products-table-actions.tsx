"use client"

import { useState } from "react"
import { Pencil, Power, Trash2 } from "lucide-react"
import type { Product } from "@/lib/admin-types"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  disableProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/actions/admin"

interface ProductsTableActionsProps {
  product: Product
}

export function ProductsTableActions({ product }: ProductsTableActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [price, setPrice] = useState(product.price)

  async function handleDisable() {
    await disableProductAction(product.id)
    setEditOpen(false)
  }

  async function handleDelete() {
    await deleteProductAction(product.id)
    setEditOpen(false)
  }

  async function handleSaveEdit() {
    await updateProductAction(product.id, { price })
    setEditOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <span className="sr-only">Actions</span>
            <Pencil className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleDisable()} className="text-amber-600">
            <Power className="mr-2 size-4" />
            Disable
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => handleDelete()}
            variant="destructive"
            className="text-red-600"
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-secondary-copy">
              {product.visa_type?.name ?? "Product"}
            </p>
            <div className="grid gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
