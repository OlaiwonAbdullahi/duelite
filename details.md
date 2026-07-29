# DueLite — Project Documentation

**NITHUB Innovation Fair Hackathon 2026 · Built on BMONI · 29–30 July 2026**

> Pay your dues. See every kobo. No stories.

---

## 1. Overview

DueLite is a campus dues-collection platform where money moves on BMONI's regulated cNGN stablecoin rails and an AI assistant (**Duey**) handles the student experience on WhatsApp.

**Target user & problem (judging criterion 1):** Course reps in Nigerian universities collect millions of naira per semester in cash and scattered transfers with no verifiable records. Students — many first-time digital-finance users — have no visibility into pooled funds. Reps get accused of misappropriation; trust breaks down every semester.

**Solution:** Every participant gets an embedded BMONI wallet. Dues move student → department as auditable cNGN transfers. The paid list is derived from BMONI's ledger, not the platform's database. Duey explains, confirms, and executes payments in chat — English or Pidgin.

**Declaration:** DueLite is inspired by Duevy, a pre-existing product idea by the author. All code, the BMONI integration, and the Duey assistant in this submission were built during the official build period. Dependencies declared in §12.

---

## 2. Architecture

```
Student (browser) ──┐
Rep (browser) ──────┤
                    ▼
             Next.js App (Vercel)
         UI (App Router) + API routes
                    │
      ┌─────────────┼──────────────────┐
      ▼             ▼                  ▼
 MongoDB Atlas   lib/bmoni.ts     lib/duey.ts (AI)
 (Prisma)        BMONI sandbox    LLM API
                 embedded-dev     │
                 .bmoni.com       ▼
                    ▲       Twilio WhatsApp
Student (WhatsApp) ─┴────── webhook /api/whatsapp
```

- **All BMONI calls are server-side** (API key never reaches the browser).
- **Custodial demo model:** DueLite's backend generates and stores each user's EVM owner key (encrypted at rest) and signs BMONI owner-proof challenges with `viem`. Declared as a hackathon simplification; production would use on-device signing per the BMONI SDK.

## 3. Stack & Environment

| Layer          | Choice                                                                        |
| -------------- | ----------------------------------------------------------------------------- |
| Framework      | Next.js 14+ (App Router, API routes — no separate backend)                    |
| Database       | MongoDB Atlas M0 via Prisma (`prisma db push`, replica set = transactions OK) |
| Payments       | BMONI Embedded sandbox (`https://embedded-dev.bmoni.com`)                     |
| Wallet signing | `viem` (EVM keypair + EIP-191 signing, replaces Flutter/RN SDK)               |
| WhatsApp       | Twilio WhatsApp Sandbox                                                       |
| AI             | [model — declare exactly what you wire]                                       |
| Hosting        | Vercel                                                                        |

```env
DATABASE_URL=mongodb+srv://...
BMONI_BASE_URL=https://embedded-dev.bmoni.com   # origin only, NO /v1
BMONI_API_KEY=...                                # server-side only
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
AI_API_KEY=...
KEY_ENCRYPTION_SECRET=...                        # for owner-key encryption at rest
```

## 4. Data Model (Prisma / MongoDB)

```prisma
model User {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  level         String?
  phone         String   @unique      // WhatsApp identity key
  passwordHash  String
  role          Role     @default(STUDENT)
  // BMONI
  bmoniUserId   String?  @unique
  walletId      String?
  walletAddress String?
  ownerKeyEnc   String?               // encrypted EVM owner private key
  provisioned   Boolean  @default(false)
  memberships   Membership[]
  payments      Payment[]
  createdAt     DateTime @default(now())
}

enum Role { STUDENT REP }

model Space {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String                 // "200L CSC Department"
  joinCode      String   @unique       // "CSC200"
  repId         String   @db.ObjectId
  // Department's own BMONI identity
  bmoniUserId   String
  walletId      String
  walletAddress String
  ownerKeyEnc   String
  items         PaymentItem[]
  memberships   Membership[]
  createdAt     DateTime @default(now())
}

model Membership {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  spaceId   String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id])
  space     Space    @relation(fields: [spaceId], references: [id])
  createdAt DateTime @default(now())
  @@unique([userId, spaceId])
}

model PaymentItem {
  id       String  @id @default(auto()) @map("_id") @db.ObjectId
  spaceId  String  @db.ObjectId
  space    Space   @relation(fields: [spaceId], references: [id])
  title    String                    // "Departmental Dues"
  amount   Int                       // kobo or naira — pick ONE and stick to it
  payments Payment[]
}

model Payment {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  userId     String   @db.ObjectId
  itemId     String   @db.ObjectId
  user       User        @relation(fields: [userId], references: [id])
  item       PaymentItem @relation(fields: [itemId], references: [id])
  amount     Int
  status     PayStatus @default(PENDING)
  bmoniTxRef String?                  // transfer reference / tx hash
  verified   Boolean  @default(false) // ✓ reconciled against BMONI ledger
  flagged    Boolean  @default(false) // Duey anomaly flag
  createdAt  DateTime @default(now())
}

enum PayStatus { PENDING PAID FAILED }
```

## 5. User Flows

### 5.1 Rep — create a space (once)

1. Rep signs up (role REP) → `provisionAccount()` runs for the rep's own identity if needed.
2. Rep creates Space → backend runs `provisionAccount()` **for the Space** → department BMONI user + cNGN wallet stored on the Space.
3. Rep adds PaymentItem ("Departmental Dues — ₦500") → shares join code / link.

### 5.2 Student — signup (one screen)

1. Fields: **name, level, phone, password.** Nothing else. No email verification, no OTP, no matric approval.
2. On submit: create User immediately → fire `provisionAccount()` **in the background** (don't block the redirect) → set `provisioned=true` when done.
3. Student lands on empty dashboard: _"Join your department to see your dues."_

### 5.3 Student — join a space

1. Enter join code `CSC200` (or open rep's link while logged in).
2. Create Membership → dashboard shows the space's items: _"Departmental Dues — ₦500 · Unpaid."_
3. One student can join many spaces; **My Dues** aggregates across all memberships. One wallet pays into all of them.

### 5.4 Student — pay dues

1. Tap **Pay ₦500** (web) or text Duey _"pay my dues"_ → confirm **YES** (WhatsApp). Same backend path.
2. If `provisioned` is false, block here with a short "setting up your account" state (background job will have finished long before in practice).
3. Backend: `getBalances(student)` → insufficient? return "fund your account" message → else execute **wallet→wallet cNGN transfer** student → space wallet.
4. On success: Payment → PAID, store `bmoniTxRef`, render receipt, Duey sends WhatsApp confirmation.

### 5.5 Reconciliation — the trust loop

- A poll (cron or on-dashboard-load) calls `getTransactions()` on the **space wallet**, matches each PAID Payment's `bmoniTxRef` against ledger entries, and sets `verified=true`.
- Dashboard renders **"✓ verified on ledger"** per payment. Pitch line: _the paid list is derived from BMONI's ledger, not DueLite's word._

### 5.6 Rep — payout

1. Rep enters bank account → `POST bank-accounts/verify-nigerian-account`.
2. Register → `POST bank-accounts/withdrawal-accounts/nigeria`.
3. Withdraw → `POST smart-wallets/:id/offramp/nigeria`. Show the offramp reference on the dashboard.

## 6. API Routes (Next.js)

| Route              | Method | Purpose                                                |
| ------------------ | ------ | ------------------------------------------------------ |
| `/api/auth/signup` | POST   | Create user, kick off background provisioning          |
| `/api/auth/login`  | POST   | Session (simple JWT or cookie)                         |
| `/api/spaces`      | POST   | Create space + provision space wallet                  |
| `/api/spaces/join` | POST   | Join by code → Membership                              |
| `/api/items`       | POST   | Rep creates PaymentItem                                |
| `/api/pay`         | POST   | Balance check → BMONI transfer → mark PAID             |
| `/api/dashboard`   | GET    | Rep view: members, paid/unpaid, totals, verified flags |
| `/api/my-dues`     | GET    | Student view across memberships                        |
| `/api/reconcile`   | POST   | Ledger reconciliation pass                             |
| `/api/payout`      | POST   | Verify → register → offramp                            |
| `/api/whatsapp`    | POST   | Twilio webhook → Duey                                  |

## 7. BMONI Integration (lib/bmoni.ts)

Lifecycle per identity (student, rep, space): **create user → viem owner wallet → owner-proof challenge → sign (EIP-191) → create-managed smart wallet (currency `CNGN`) → sandbox KYC (test BVN `22222222222`, country `NGA`) → `onboarding/start-nigeria` → poll status until active.**

Endpoints in use: `POST /v1/users` · `POST .../smart-wallets/owner-proof-challenges` · `POST .../smart-wallets/create-managed` · KYC wizard (`GET options` → doc uploads if required → `PATCH /kyc` → `GET readiness` → `POST activate`) · `POST .../onboarding/start-nigeria` · `GET .../onboarding/status` · `GET .../smart-wallets/account/{wallets,balances,transactions}` · **wallet→wallet cNGN transfer (endpoint from BMONI desk)** · payout chain (§5.6) · `POST .../vba/ngn` (production funding story).

Rules honored: base URL has no `/v1`; `x-api-key` on every request; CNGN not NGN for wallet currency; unique email/phone per created user (generate `duelite+<phone>@…` synthetics); real BVN/NIN never used; API key never in frontend, screenshots, slides, or the public repo.

**Sandbox funding:** BMONI desk credits ₦1,000 test cNGN per phone number. Pre-provision and pre-fund 3–4 demo students; set demo dues at ₦200–₦500 for multiple live payments.

## 8. Duey — AI Assistant

**Channels:** meta WhatsApp api+ optional web chat widget reusing the same handler.

**Identity:** inbound WhatsApp number → `User.phone` lookup. No linking step — signup captured the phone, so Duey already knows who's texting.

**Intents (deterministic-first, model for language):**
| Intent | Data source | Action |
|---|---|---|
| "how much do I owe?" | My-dues query | List unpaid items per space |
| "pay my dues" | `/api/pay` path | Confirm YES → execute transfer → receipt |
| "did my payment enter?" | Payment + bmoniTxRef | Confirm with ledger status |
| "what have we spent?" / "wetin we don spend?" | Space transactions | Plain-language (English/Pidgin) summary |
| anything else | model | Grounded answer or polite redirect |

**Anomaly watch (fraud-awareness point):** on each new payment, check for duplicate (same user+item already PAID) or off-amount transfers → set `flagged=true` → Duey notifies the rep.

**AI safety (their explicit rule):** the model receives only names, amounts, statuses, and transaction summaries. **Never** send the BMONI API key, BVN, owner keys, or raw identity data to the model. State this in the pitch — it's a scored criterion.

## 9. Privacy, Security & Responsible Finance

- Test data and test funds only; no real BVN/NIN/identity documents anywhere.
- BMONI key server-side in env vars; owner keys encrypted at rest (`KEY_ENCRYPTION_SECRET`); repo history checked for leaked secrets before making it public.
- Custodial key handling disclosed as a demo simplification (production: on-device signing via BMONI SDK).
- Fee/amount always displayed before a payment is confirmed (web and WhatsApp).
- NDPR-aware posture: minimal personal data (name, level, phone), collected for the stated purpose only.

**Backup:** screen-recording of the full flow + saved JSON of key API responses (record these during the night — sandbox may be unstable during judging).

## 11. Build Order (tonight)

1. `provisionAccount()` green end-to-end (script, not UI) — **first, before any UI**
2. Get transfer endpoint from BMONI desk → wire `payDues()` → one successful student→space transfer
3. Auth + signup (background provisioning) + space create/join
4. `/api/pay` + receipt + dashboard with reconciliation
5. Twilio webhook + Duey intents
6. Anomaly flag + Pidgin summaries
7. Deploy, seed demo users, fund them at the desk, record backup demo, slides

## 12. Declared Dependencies

Next.js, React, Prisma, MongoDB Atlas, viem, Twilio (WhatsApp Sandbox), Tailwind, [AI model + provider], BMONI Embedded sandbox API. Pre-existing: the Duevy concept/brand (author's own prior idea — no prior code reused).

## 13. Known Limitations (say them before judges find them)

- Custodial owner keys (demo simplification)
- No matric verification / approval queue (production Duevy feature)
- Quorum-approved payouts not in this build (roadmap; mention in Q&A)
- Sandbox only — no real funds, no live NGN settlement
- WhatsApp via Twilio sandbox (production path: Meta WhatsApp Business API)
