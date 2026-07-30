import { chromium } from "playwright"

const BASE = "http://localhost:3000"
const shots = "C:\\Users\\HP\\AppData\\Local\\Temp\\claude\\c--Users-HP-Desktop-due-lite\\8602d73b-7f03-4246-b3ee-7af326b20062\\scratchpad\\shots"

function uniquePhone() {
  // 234 + 10-digit local number (8 + 9 unique digits from the clock)
  return `+2348${String(Date.now()).slice(-9)}`
}

async function main() {
  const browser = await chromium.launch({ args: ["--no-sandbox"] })
  const page = await browser.newPage()
  globalThis.__page = page
  const errors = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`))

  const log = (msg) => console.log(`[test] ${msg}`)

  // 1. Student signup
  const studentPhone = uniquePhone()
  log(`Student signup with phone ${studentPhone}`)
  await page.goto(`${BASE}/signup`)
  await page.getByText("Student", { exact: true }).click()
  await page.getByRole("button", { name: "Continue" }).click()
  await page.getByLabel("Full name").fill("Smoke Test Student")
  await page.selectOption("#level", "200L")
  await page.getByLabel("Phone number").fill(studentPhone)
  await page.locator("#password").fill("password123")
  await page.getByRole("button", { name: /Create account/ }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 90000 })
  log(`Landed on ${page.url()} after student signup`)
  await page.waitForSelector("text=Overview", { timeout: 30000 })
  await page.screenshot({ path: `${shots}/01-student-overview.png`, fullPage: true })
  log("Student overview loaded")

  // 3. Join space with bad code
  await page.goto(`${BASE}/dashboard/space`)
  await page.waitForSelector("text=My Spaces")
  await page.getByRole("button", { name: "Join a space" }).click()
  await page.getByLabel("Join code").fill("NOPE123")
  await page.getByRole("button", { name: "Join space" }).click()
  await page.waitForSelector("text=couldn't find that space", { timeout: 10000 })
  await page.screenshot({ path: `${shots}/02-join-error.png`, fullPage: true })
  log("Join-space error displayed correctly")
  await page.keyboard.press("Escape")

  // 4. Logout + middleware redirect check
  await page.getByRole("button", { name: "Log out" }).first().click()
  await page.waitForURL(/\/login/, { timeout: 10000 })
  log(`Redirected to ${page.url()} after logout`)
  await page.goto(`${BASE}/dashboard`)
  await page.waitForURL(/\/login/, { timeout: 10000 })
  log(`Middleware redirected protected route to ${page.url()}`)

  // 5. Rep signup
  const repPhone = uniquePhone()
  log(`Rep signup with phone ${repPhone}`)
  await page.goto(`${BASE}/signup`)
  await page.getByText("Course rep", { exact: true }).click()
  await page.getByRole("button", { name: "Continue" }).click()
  await page.getByLabel("Full name").fill("Smoke Test Rep")
  await page.getByLabel("Phone number").fill(repPhone)
  await page.locator("#password").fill("password123")
  await page.getByRole("button", { name: /Create account/ }).click()
  await page.waitForURL(/\/rep\/new-space/, { timeout: 30000 })
  log("Landed on /rep/new-space")

  await page.getByLabel("Space name").fill("Smoke Test Department")
  await page.getByRole("button", { name: "Create space" }).click()
  await page.waitForSelector("text=Your space is live.", { timeout: 30000 })
  const joinCode = await page.locator("p.font-mono").first().textContent()
  log(`Generated join code: ${joinCode?.trim()}`)
  await page.screenshot({ path: `${shots}/03-space-created.png`, fullPage: true })

  // 6. Into dashboard as rep
  await page.getByRole("button", { name: "Go to dashboard" }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 20000 })
  await page.goto(`${BASE}/dashboard/space`)
  await page.waitForSelector("text=Members", { timeout: 20000 })
  await page.screenshot({ path: `${shots}/04-rep-space.png`, fullPage: true })
  log("Rep space page loaded with Members section")

  console.log("\n[test] Console errors captured:", errors.length ? errors : "none")

  await browser.close()
  return { errors }
}

main().catch(async (err) => {
  console.error("[test] FAILED:", err.message)
  try {
    if (globalThis.__page) {
      await globalThis.__page.screenshot({ path: `${shots}/FAILURE.png`, fullPage: true })
      console.error("[test] URL at failure:", globalThis.__page.url())
      console.error("[test] Body text at failure:\n", (await globalThis.__page.locator("body").innerText()).slice(0, 2000))
    }
  } catch (e2) {
    console.error("[test] Could not capture failure state:", e2.message)
  }
  process.exit(1)
})
