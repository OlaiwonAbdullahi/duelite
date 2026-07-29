// scripts/provision-test.ts
//
// Standalone script (no Next.js server needed) that runs BMONI's
// user/wallet provisioning lifecycle end-to-end against the sandbox.
// lib/bmoni.ts logs every raw request/response as it goes — that's the
// point of this script right now: capture what BMONI actually returns so
// the guessed endpoint paths and response-shape parsing in lib/bmoni.ts can
// be corrected.
//
// It will very likely fail partway on the first run. When it does, the
// [BMONI] ... log lines above the failure ARE the real response — that's
// what needs to come back here to get things wired up properly.
//
// Usage:
//   pnpm provision:test
//   pnpm provision:test +2348010000002 "Another Test Name"

import { config } from "dotenv"
config({ path: ".env" })

import { provisionAccount } from "../lib/bmoni"

function randomTestPhone() {
  const suffix = String(Date.now()).slice(-7)
  return `+23480${suffix}`
}

async function main() {
  const phone = process.argv[2] ?? randomTestPhone()
  const name = process.argv[3] ?? "DueLite Test Student"

  try {
    const result = await provisionAccount({ name, phone })
    console.log("\n=== SUCCESS ===")
    console.log(result)
  } catch (err) {
    console.log("\n=== FAILED ===")
    console.log(err instanceof Error ? err.message : err)
    process.exitCode = 1
  }
}

main()
