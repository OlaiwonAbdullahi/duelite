import type { User } from "@prisma/client"
import type OpenAI from "openai"

import { getMyDuesData } from "@/lib/services/my-dues"
import { getDashboardData, NoManagedSpaceError } from "@/lib/services/dashboard"
import { previewDue, payDue } from "@/lib/services/pay"

export const DUEY_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_dues_summary",
      description:
        "Get the current user's own wallet balance and every space they've joined, with each payment item's title, amount, id, and status (PENDING/PAID/FAILED). Always call this before answering 'how much do I owe' or before calling pay_due, so you have real itemIds and amounts instead of guessing.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_space_overview",
      description:
        "For a course rep only: get totals (collected, outstanding, verified count, member count), the member payment grid, and any fraud/anomaly flags for the department the current user manages. Returns an error if the user doesn't manage a space.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "pay_due",
      description:
        "Preview or execute payment of one dues item for the current user. ALWAYS call with confirm=false first — this only previews the amount and checks their balance, it moves no money. Relay that preview to the user in plain language and wait for them to clearly say yes/confirm/go ahead in their own next message. Only then call this again with the SAME itemId and confirm=true to actually move the money. Never set confirm=true on the first call.",
      parameters: {
        type: "object",
        properties: {
          itemId: {
            type: "string",
            description: "The payment item id, taken from get_dues_summary's spaces[].items[].id",
          },
          confirm: {
            type: "boolean",
            description: "false to preview only (default), true to actually execute the transfer",
          },
        },
        required: ["itemId", "confirm"],
      },
    },
  },
]

export async function executeDueyTool(
  name: string,
  rawArgs: string,
  user: User
): Promise<unknown> {
  let args: Record<string, unknown>
  try {
    args = rawArgs ? JSON.parse(rawArgs) : {}
  } catch {
    return { error: "Malformed tool arguments" }
  }

  switch (name) {
    case "get_dues_summary":
      return getMyDuesData(user)

    case "get_space_overview":
      try {
        return await getDashboardData(user)
      } catch (err) {
        if (err instanceof NoManagedSpaceError) return { error: err.message }
        throw err
      }

    case "pay_due": {
      const itemId = String(args.itemId ?? "")
      const confirm = args.confirm === true
      if (!itemId) return { error: "itemId is required" }
      return confirm ? payDue(user, itemId) : previewDue(user, itemId)
    }

    default:
      return { error: `Unknown tool: ${name}` }
  }
}
