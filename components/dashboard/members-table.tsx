import { Card } from "@/components/ui/card"
import { StatusPill } from "@/components/dashboard/status-pill"
import type { MemberRow } from "@/lib/types"

function MembersTable({
  members,
  items,
}: {
  members: MemberRow[]
  items: { id: string; title: string }[]
}) {
  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline">
            <th className="px-5 py-3 text-[12px] font-medium text-ink-soft">Student</th>
            {items.map((item) => (
              <th key={item.id} className="px-5 py-3 text-[12px] font-medium text-ink-soft">
                {item.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {members.map((member) => (
            <tr key={member.id}>
              <td className="px-5 py-3.5">
                <p className="text-[14px] font-medium text-ink">{member.name}</p>
                <p className="text-[12px] text-ink-soft">{member.phone}</p>
              </td>
              {items.map((item) => {
                const payment = member.payments[item.id] ?? {
                  status: "PENDING" as const,
                  verified: false,
                  flagged: false,
                }
                return (
                  <td key={item.id} className="px-5 py-3.5">
                    <StatusPill
                      status={payment.status}
                      verified={payment.verified}
                      flagged={payment.flagged}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export { MembersTable }
