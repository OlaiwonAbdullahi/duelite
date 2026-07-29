"use client"

import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react"
import { Briefcase01Icon, StudentIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

export type AuthRole = "STUDENT" | "REP"

const ROLES: {
  value: AuthRole
  label: string
  description: string
  icon: HugeiconsIconProps["icon"]
}[] = [
  {
    value: "STUDENT",
    label: "Student",
    description: "Join a department, pay dues, and see where your money goes.",
    icon: StudentIcon,
  },
  {
    value: "REP",
    label: "Course rep",
    description: "Run a department — collect dues and manage payouts.",
    icon: Briefcase01Icon,
  },
]

function RoleCards({
  value,
  onChange,
}: {
  value: AuthRole | null
  onChange: (role: AuthRole) => void
}) {
  return (
    <div className="flex flex-col gap-3" role="radiogroup">
      {ROLES.map((role) => {
        const selected = value === role.value
        return (
          <button
            key={role.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(role.value)}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              selected ? "border-primary bg-cloud" : "border-hairline bg-canvas hover:bg-cloud/60"
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cloud">
              <HugeiconsIcon icon={role.icon} size={20} color="var(--primary)" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-ink">{role.label}</p>
              <p className="mt-0.5 text-[13px] leading-[1.4] text-ink-soft">{role.description}</p>
            </div>
            <div
              className={cn(
                "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                selected ? "border-primary" : "border-hairline-strong/30"
              )}
            >
              {selected && <div className="size-2.5 rounded-full bg-primary" />}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export { RoleCards }
