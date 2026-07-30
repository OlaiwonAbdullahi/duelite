import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { Skeleton } from "@/components/ui/skeleton"

const NAV_ITEM_COUNT = 4

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <HugeiconsIcon icon={Loading03Icon} size={18} className="animate-spin text-ink-soft" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="hidden size-9 rounded-full lg:block" />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1280px] flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-hairline bg-canvas sm:block">
          <div className="flex h-[calc(100vh-4rem)] flex-col justify-between">
            <nav className="flex flex-col gap-1 p-4">
              {Array.from({ length: NAV_ITEM_COUNT }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </nav>
            <div className="flex items-center gap-2.5 border-t border-hairline p-4">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </main>
      </div>
    </div>
  )
}

export { DashboardSkeleton }
