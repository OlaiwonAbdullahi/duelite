import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function StatTile({
  label,
  value,
  icon,
  iconColor = "var(--primary)",
  className,
}: {
  label: string
  value: string
  icon: HugeiconsIconProps["icon"]
  iconColor?: string
  className?: string
}) {
  return (
    <Card className={cn("flex flex-col gap-3 p-5", className)}>
      <div className="flex size-9 items-center justify-center rounded-full bg-cloud">
        <HugeiconsIcon icon={icon} size={18} color={iconColor} />
      </div>
      <div>
        <p className="text-[22px] font-semibold leading-[1.2] text-ink">{value}</p>
        <p className="mt-0.5 text-[13px] leading-[1.4] text-ink-soft">{label}</p>
      </div>
    </Card>
  )
}

export { StatTile }
