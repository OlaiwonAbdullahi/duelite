// One-time fix: recreates the bmoniUserId unique index as a *sparse* index,
// so multiple unprovisioned users (bmoniUserId never set) don't collide on
// MongoDB's default null-equals-missing unique-index behavior. See the
// comment on User.bmoniUserId in prisma/schema.prisma for the full story.
//
// Usage: pnpm tsx scripts/fix-bmoni-unique-index.ts

import { config } from "dotenv"
config({ path: ".env" })

import { PrismaClient } from "@prisma/client"

async function main() {
  const prisma = new PrismaClient()
  const result = await prisma.$runCommandRaw({
    createIndexes: "User",
    indexes: [{ key: { bmoniUserId: 1 }, name: "User_bmoniUserId_key", unique: true, sparse: true }],
  })
  console.log(JSON.stringify(result, null, 2))
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error("FAILED:", err)
  process.exit(1)
})
