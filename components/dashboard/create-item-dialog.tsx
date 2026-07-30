"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function CreateItemDialog({
  onCreate,
}: {
  onCreate: (item: { title: string; amount: number }) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!title.trim() || !parsed) return
    setSubmitting(true)
    await onCreate({ title: title.trim(), amount: parsed })
    setSubmitting(false)
    setTitle("")
    setAmount("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
        <HugeiconsIcon icon={Add01Icon} size={16} />
        New payment item
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New payment item</DialogTitle>
          <DialogDescription>
            This shows up immediately for every member of your space.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="itemTitle">Title</Label>
            <Input
              id="itemTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Departmental Dues"
              autoFocus
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="itemAmount">Amount (₦)</Label>
            <Input
              id="itemAmount"
              type="number"
              inputMode="numeric"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              required
            />
          </div>
          <button type="submit" disabled={submitting} className={cn(buttonVariants(), "mt-2 w-full")}>
            {submitting ? "Creating…" : "Create item"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { CreateItemDialog }
