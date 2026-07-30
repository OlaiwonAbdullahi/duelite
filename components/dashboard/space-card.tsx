import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight02Icon, Alert01Icon } from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import type { StudentSpace } from "@/lib/types"

function SpaceCard({ space }: { space: StudentSpace }) {
  const outstanding = space.items
    .filter((i) => i.status !== "PAID")
    .reduce((sum, i) => sum + i.amount, 0)
  const paidCount = space.items.filter((i) => i.status === "PAID").length
  const flagged = space.items.some((i) => i.flagged)

  return (
    <Link href={`/dashboard/space/${space.id}`}>
      <Card className="flex h-full flex-col gap-4 p-5 transition-colors duration-300 hover:border-primary/40 cursor-pointer">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-ink">{space.name}</h3>
          <HugeiconsIcon icon={ArrowRight02Icon} size={16} className="mt-0.5 shrink-0 text-ink-soft" />
        </div>

        <span className="w-fit rounded-full bg-cloud px-2.5 py-1 font-mono text-[12px] font-medium text-ink-soft">
          {space.joinCode}
        </span>

        <div className="mt-auto flex items-center justify-between text-[13px]">
          <span className="text-ink-soft">
            {paidCount}/{space.items.length} paid
          </span>
          {flagged ? (
            <span className="flex items-center gap-1 font-medium text-accent-gold">
              <HugeiconsIcon icon={Alert01Icon} size={13} />
              Flagged
            </span>
          ) : outstanding > 0 ? (
            <span className="font-semibold text-ink">₦{outstanding.toLocaleString()} due</span>
          ) : (
            <span className="font-semibold text-primary">All paid</span>
          )}
        </div>
      </Card>
    </Link>
  )
}

export { SpaceCard }
