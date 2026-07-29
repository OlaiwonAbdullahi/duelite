"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, UserGroupIcon } from "@hugeicons/core-free-icons"

import { SpaceCard } from "@/components/dashboard/space-card"
import { EmptyState } from "@/components/dashboard/empty-state"
import { JoinSpaceDialog } from "@/components/dashboard/join-space-dialog"
import { MembersTable } from "@/components/dashboard/members-table"
import { CreateItemDialog } from "@/components/dashboard/create-item-dialog"
import { useDashboard } from "@/components/dashboard/dashboard-context"
import { repMembers, repSpace } from "@/lib/dummy-data"

function SpacePage() {
  const { role, spaces, setSpaces, items, setItems } = useDashboard()
  const isRep = role === "REP"

  const [copied, setCopied] = useState(false)

  function handleCopyCode() {
    navigator.clipboard?.writeText(repSpace.joinCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold text-ink">My Spaces</h1>
            <p className="mt-1 text-[14px] text-ink-soft">
              Departments and groups you&apos;ve joined as a member.
            </p>
          </div>
          <JoinSpaceDialog
            joinedCodes={spaces.map((s) => s.joinCode)}
            onJoin={(space) => setSpaces((prev) => [...prev, space])}
          />
        </div>

        <div className="mt-5">
          {spaces.length === 0 ? (
            <EmptyState
              icon={UserGroupIcon}
              title="Join your department to see your dues."
              description="Ask your course rep for their join code, then add it here."
              action={
                <JoinSpaceDialog
                  joinedCodes={[]}
                  onJoin={(space) => setSpaces((prev) => [...prev, space])}
                />
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {spaces.map((space) => (
                <SpaceCard key={space.id} space={space} />
              ))}
            </div>
          )}
        </div>
      </div>

      {isRep && (
        <div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-ink">{repSpace.name}</h2>
              <p className="mt-1 text-[13px] text-ink-soft">The department you manage as course rep.</p>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex w-fit items-center gap-2 rounded-full bg-cloud px-4 py-2 font-mono text-[13px] font-medium text-ink transition-colors duration-300 hover:bg-hairline cursor-pointer"
            >
              <HugeiconsIcon icon={Copy01Icon} size={14} />
              {copied ? "Copied!" : repSpace.joinCode}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-ink">Members</h3>
            <CreateItemDialog
              onCreate={(item) =>
                setItems((prev) => [...prev, { id: `item_${Date.now()}`, ...item }])
              }
            />
          </div>
          <div className="mt-3">
            <MembersTable members={repMembers} items={items} />
          </div>
        </div>
      )}
    </div>
  )
}

export default SpacePage
