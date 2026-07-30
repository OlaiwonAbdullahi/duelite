import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import type { PayStatus } from "@/lib/types"

function StatusPill({
  status,
  verified,
  flagged,
  className,
}: {
  status: PayStatus
  verified: boolean
  flagged?: boolean
  className?: string
}) {
  if (flagged) {
    return (
      <Pill className={cn("bg-accent-gold/15 text-accent-gold", className)}>
        <HugeiconsIcon icon={Alert01Icon} size={13} />
        Flagged
      </Pill>
    )
  }

  if (status === "PAID" && verified) {
    return (
      <Pill className={cn("bg-cloud text-primary", className)}>
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
        Verified on ledger
      </Pill>
    )
  }

  if (status === "PAID" && !verified) {
    return (
      <Pill className={cn("bg-cloud text-primary/80", className)}>
        <HugeiconsIcon icon={Loading03Icon} size={13} />
        Paid · confirming
      </Pill>
    )
  }

  if (status === "FAILED") {
    return (
      <Pill className={cn("bg-destructive/10 text-destructive", className)}>
        <HugeiconsIcon icon={Alert01Icon} size={13} />
        Failed
      </Pill>
    )
  }

  return <Pill className={cn("bg-paper text-ink-soft", className)}>Unpaid</Pill>
}

function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-[12px] font-medium leading-[1.4] whitespace-nowrap",
        className
      )}
    >
      {children}
    </span>
  )
}

export { StatusPill }
