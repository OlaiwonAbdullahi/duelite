"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Tick01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

function Checkbox({
  checked,
  onCheckedChange,
  className,
  "aria-label": ariaLabel,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
  "aria-label"?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        checked ? "border-primary bg-primary" : "border-hairline-strong/40 bg-canvas hover:border-primary/50",
        className
      )}
    >
      {checked && <HugeiconsIcon icon={Tick01Icon} size={13} color="var(--on-primary)" />}
    </button>
  )
}

export { Checkbox }
