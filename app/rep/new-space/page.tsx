"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons"

import { AuthShell } from "@/components/auth/auth-shell"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const GENERATED_JOIN_CODE = "CSC300"

export default function NewSpacePage() {
  const router = useRouter()
  const [step, setStep] = useState<"form" | "created">("form")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [spaceName, setSpaceName] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep("created")
    }, 600)
  }

  function handleCopy() {
    navigator.clipboard?.writeText(GENERATED_JOIN_CODE).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (step === "created") {
    return (
      <AuthShell
        title="Your space is live."
        description="A BMONI wallet has been created for your department. Share this code so students can join."
        footer={null}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-cloud">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={28} color="var(--primary)" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-ink-soft">
              {spaceName || "Your department"}
            </p>
            <p className="mt-1 text-[13px] leading-[1.4] text-ink-soft">Join code</p>
            <p className="mt-1 font-mono text-[32px] font-semibold tracking-[0.15em] text-ink">
              {GENERATED_JOIN_CODE}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
          >
            <HugeiconsIcon icon={Copy01Icon} size={16} />
            {copied ? "Copied!" : "Copy join code"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard?role=rep")}
            className={cn(buttonVariants(), "w-full")}
          >
            Go to dashboard
            <HugeiconsIcon icon={ArrowRight02Icon} size={18} />
          </button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Set up your department space."
      description="This opens a BMONI wallet for your department."
      footer={null}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="spaceName">Space name</Label>
          <Input
            id="spaceName"
            name="spaceName"
            placeholder="e.g. 300L Computer Science Department"
            value={spaceName}
            onChange={(e) => setSpaceName(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(buttonVariants(), "mt-2 w-full")}
        >
          {loading ? "Setting up your wallet…" : "Create space"}
          {!loading && <HugeiconsIcon icon={ArrowRight02Icon} size={18} />}
        </button>
      </form>
    </AuthShell>
  )
}
