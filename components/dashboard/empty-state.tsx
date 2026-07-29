import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react"

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: HugeiconsIconProps["icon"]
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-hairline-strong/40 bg-paper px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-cloud">
        <HugeiconsIcon icon={icon} size={22} color="var(--primary)" />
      </div>
      <div>
        <h3 className="text-[16px] font-semibold text-ink">{title}</h3>
        <p className="mx-auto mt-1 max-w-sm text-[14px] leading-[1.5] text-ink-soft">
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}

export { EmptyState }
