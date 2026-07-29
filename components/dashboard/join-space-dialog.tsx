"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

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
import { joinableSpaceDirectory, type StudentSpace } from "@/lib/dummy-data"
import { cn } from "@/lib/utils"

function JoinSpaceDialog({
  joinedCodes,
  onJoin,
}: {
  joinedCodes: string[]
  onJoin: (space: StudentSpace) => void
}) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [joinedSpace, setJoinedSpace] = useState<StudentSpace | null>(null)

  function reset() {
    setCode("")
    setError(null)
    setJoinedSpace(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const normalized = code.trim().toUpperCase()
    if (joinedCodes.includes(normalized)) {
      setError("You're already in this space.")
      return
    }
    const space = joinableSpaceDirectory[normalized]
    if (!space) {
      setError("We couldn't find that space. Check the code and try again.")
      return
    }
    setError(null)
    setJoinedSpace(space)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger className={cn(buttonVariants({ variant: "secondary" }))}>
        <HugeiconsIcon icon={Add01Icon} size={16} />
        Join a space
      </DialogTrigger>
      <DialogContent>
        {joinedSpace ? (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-cloud">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} color="var(--primary)" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-ink">You&apos;re in!</h3>
              <p className="mt-1 text-[14px] leading-[1.5] text-ink-soft">
                {joinedSpace.name} now shows up in your dues.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onJoin(joinedSpace)
                setOpen(false)
                reset()
              }}
              className={cn(buttonVariants(), "w-full")}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Join a space</DialogTitle>
              <DialogDescription>
                Enter the join code your course rep shared with you.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-1.5">
              <Label htmlFor="joinCode">Join code</Label>
              <Input
                id="joinCode"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setError(null)
                }}
                placeholder="e.g. CSC300"
                className="uppercase"
                autoFocus
              />
              {error && <p className="mt-1 text-[13px] text-destructive">{error}</p>}
              <button type="submit" className={cn(buttonVariants(), "mt-4 w-full")}>
                Join space
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { JoinSpaceDialog }
