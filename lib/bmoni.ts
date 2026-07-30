// BMONI Embedded (sandbox) integration — lib/bmoni.ts
//
// All calls are server-side only. BMONI_API_KEY must never reach the browser.
//
// Endpoint paths/schemas below are confirmed against:
//  1. The official hackathon Quick Start (base URL, auth, recommended NGN flow)
//  2. https://bkey.mintlify.app/api-reference/integration-flow.md
//  3. https://bkey.mintlify.app/api-reference/kyc-nga-requirements.md
//  4. Live requests against the sandbox — every call logs its raw
//     request/response below, and several field names here were corrected
//     from BMONI's own 400 validation errors during that process.
//
// Still UNCONFIRMED: the wallet-to-wallet cNGN transfer used for `payDues()`.
// It isn't in the public docs (details.md flags it as "endpoint from BMONI
// desk"). transferCngn() below is a best guess based on the closest
// documented endpoint (crypto withdrawal to an external address) — verify
// with BMONI staff before relying on it.

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import type { Hex } from "viem"

// BMONI response shapes are still being reverse-engineered against the live
// sandbox; a permissive alias here beats scattering `any` at every call site.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BmoniResponse = any

export class BmoniError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = "BmoniError"
    this.status = status
    this.body = body
  }
}

async function bmoniRequest<T = unknown>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown
): Promise<T> {
  const BASE_URL = process.env.BMONI_BASE_URL
  const API_KEY = process.env.BMONI_API_KEY
  if (!BASE_URL) throw new Error("BMONI_BASE_URL is not set")
  if (!API_KEY) throw new Error("BMONI_API_KEY is not set")

  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const raw = await res.text()
  let parsed: unknown = raw
  try {
    parsed = raw ? JSON.parse(raw) : null
  } catch {
    // non-JSON response — keep raw text so it still shows up in the log
  }

  console.log(`\n[BMONI] ${method} ${path} -> ${res.status}`)
  if (body) console.log("  request body:", JSON.stringify(body, null, 2))
  console.log("  response:", JSON.stringify(parsed, null, 2))

  if (!res.ok) {
    throw new BmoniError(`BMONI ${method} ${path} failed with ${res.status}`, res.status, parsed)
  }

  return parsed as T
}

// ---------------------------------------------------------------------------
// Owner wallet (viem) — custodial demo model, see details.md §2
// ---------------------------------------------------------------------------

export function generateOwnerWallet() {
  const privateKey = generatePrivateKey()
  const address = privateKeyToAccount(privateKey).address
  return { privateKey, address }
}

export async function signOwnerProof(privateKey: Hex, message: string) {
  const account = privateKeyToAccount(privateKey)
  return account.signMessage({ message })
}

export function syntheticEmail(phone: string) {
  const digits = phone.replace(/[^0-9]/g, "")
  return `duelite+${digits}@duelite.app`
}

// ---------------------------------------------------------------------------
// User + smart wallet creation
// ---------------------------------------------------------------------------

export interface CreateBmoniUserInput {
  name: string
  phone: string
  email?: string
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/)
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") || undefined }
}

export async function createBmoniUser(input: CreateBmoniUserInput) {
  const { firstName, lastName } = splitName(input.name)
  return bmoniRequest<BmoniResponse>("POST", "/v1/users", {
    firstName,
    lastName,
    email: input.email ?? syntheticEmail(input.phone),
    phoneNumber: input.phone,
  })
}

export async function createOwnerProofChallenge(userId: string, ownerAddress: string) {
  return bmoniRequest<BmoniResponse>("POST", `/v1/users/${userId}/smart-wallets/owner-proof-challenges`, {
    currency: "CNGN",
    userOwnerAddress: ownerAddress,
  })
}

export async function createManagedSmartWallet(
  userId: string,
  params: { ownerAddress: string; signature: string; challengeId: string }
) {
  return bmoniRequest<BmoniResponse>("POST", `/v1/users/${userId}/smart-wallets/create-managed`, {
    currency: "CNGN",
    userOwnerAddress: params.ownerAddress,
    ownerProofSignature: params.signature,
    ownerProofChallengeId: params.challengeId,
  })
}

export async function getSmartWalletDetail(userId: string, smartWalletId: string) {
  return bmoniRequest<BmoniResponse>("GET", `/v1/users/${userId}/smart-wallets/${smartWalletId}`)
}

// ---------------------------------------------------------------------------
// Sandbox KYC wizard — schema confirmed via kyc-nga-requirements.md
// ---------------------------------------------------------------------------

export async function getKycOptions(userId: string) {
  return bmoniRequest<BmoniResponse>("GET", `/v1/users/${userId}/kyc/options`)
}

export async function searchOccupations(userId: string, search: string) {
  return bmoniRequest<BmoniResponse>("GET", `/v1/users/${userId}/kyc/occupations?search=${encodeURIComponent(search)}`)
}

export interface KycPersonalInfo {
  firstName: string
  lastName?: string
  phoneNumber: string
  dateOfBirth: string // ISO date, e.g. "2000-01-01"
  gender?: string
}
export interface KycAddress {
  streetLine1: string
  city: string
  state: string
  postalCode: string
  countryCode: string // "NGA"
}
export interface KycEmployment {
  employmentStatus: string
  occupationCode: string
  employerName?: string
}
export interface KycIdentificationNumber {
  type: "bvn" | "nin"
  number: string
  issuingCountryCode: string // "NGA"
}

// Real top-level shape confirmed via 400s: `personal`/`compliance` wrappers
// are rejected outright ("property personal should not exist"). The earlier
// `missing` array used dotted paths for nested fields (personalInfo.dateOfBirth,
// address.streetLine1) but a bare `sourceOfFunds` — so compliance fields are
// flat at the top level, and the personal-info key is `personalInfo`.
// identificationNumbers (e.g. BVN) is distinct from identificationDocuments
// (an uploaded ID image) — submitting one does not satisfy the other; both
// are required before KYC can activate.
export async function patchKyc(
  userId: string,
  body: {
    personalInfo: KycPersonalInfo
    address: KycAddress
    employment: KycEmployment
    sourceOfFunds: string
    estimatedMonthlyVolume?: number
    accountPurpose?: string
    identificationNumbers?: KycIdentificationNumber[]
  }
) {
  return bmoniRequest<BmoniResponse>("PATCH", `/v1/users/${userId}/kyc`, body)
}

// Note: getKycReadiness/kyc/activate (with sumsubLevelName) are the generic
// sumsub-verified rail's gate (USD/EUR/CAD) — confirmed with BMONI that
// Nigeria's BVN-based rail doesn't use them, so they're not wired here.

// ---------------------------------------------------------------------------
// Nigeria onboarding
// ---------------------------------------------------------------------------

export async function startNigeriaOnboarding(
  userId: string,
  params: { bvn: string; ngnWalletAddress: string; ngnWalletIndex: number }
) {
  return bmoniRequest<BmoniResponse>("POST", `/v1/users/${userId}/onboarding/start-nigeria`, {
    bvn: params.bvn,
    ngnWalletAddress: params.ngnWalletAddress,
    ngnWalletIndex: params.ngnWalletIndex,
  })
}

export async function getOnboardingStatus(userId: string) {
  return bmoniRequest<BmoniResponse>("GET", `/v1/users/${userId}/onboarding/status`)
}

// The integration-flow doc describes this as `{ status, activeCurrencies }`,
// but the sandbox actually returns per-provider flags (anchorStatus,
// bridgeStatus, moneriumStatus, paytrieStatus, etherfuseStatus) — none of
// which is Nigeria-specific, and none of which we've seen leave
// "not_started" yet because KYC activation is still blocked on document
// uploads (see provisionAccount). Polling against an unconfirmed "done"
// condition would just spin forever, so this does a single fetch-and-log
// instead of a blocking loop until the real completion signal is known —
// re-test once uploadIdentificationDocument()'s field name is confirmed and
// KYC activation actually succeeds.
export async function checkOnboardingStatus(userId: string) {
  const status = await getOnboardingStatus(userId)
  console.log(`[bmoni] onboarding status (interpretation unconfirmed):`, status)
  return status
}

// ---------------------------------------------------------------------------
// Wallet account queries — user-scoped per the integration flow docs
// ---------------------------------------------------------------------------

export async function getWalletAccount(userId: string) {
  return bmoniRequest<BmoniResponse>("GET", `/v1/users/${userId}/smart-wallets/account/wallets`)
}

export async function getBalances(userId: string) {
  return bmoniRequest<BmoniResponse>("GET", `/v1/users/${userId}/smart-wallets/account/balances`)
}

export async function getTransactions(userId: string) {
  return bmoniRequest<BmoniResponse>("GET", `/v1/users/${userId}/smart-wallets/account/transactions`)
}

// Confirmed live shape: { smartAccountAddress, balances: [{ smartWalletId, currency, balance, error }] }.
// The wallet's `currency` field reads "NGN" (not CNGN) even though it was
// created with currency: "CNGN" — matching that quirk here rather than
// guessing further.
export function extractNgnBalance(balancesResponse: BmoniResponse): number {
  const balances: BmoniResponse[] = balancesResponse?.balances ?? []
  const entry = balances.find((b) => b?.currency === "NGN" || b?.currency === "CNGN")
  return entry ? Number(entry.balance) || 0 : 0
}

// ---------------------------------------------------------------------------
// Proposal signing — BMONI's generic pattern for any money-movement action
// on a smart wallet (confirmed via the Nigeria withdrawal flow docs): the
// action-specific endpoint (e.g. offramp/nigeria) returns a *proposal*
// (status PENDING_APPROVALS), not a completed result. You then:
//   1. GET  the EIP-712 sign payload for that proposal
//   2. sign it with the wallet's registered owner key (viem, not the BMONI
//      SDK — same tradeoff as the owner-proof challenge, see details.md §2)
//   3. POST the hex signature back
//   4. poll GET the proposal until it reaches a terminal status
// This pattern is presumed generic across proposal-creating endpoints (so
// it should also apply to the still-unconfirmed wallet-to-wallet transfer),
// but has only been exercised here via the documented offramp flow.
// ---------------------------------------------------------------------------

export async function getProposalSignPayload(userId: string, proposalId: string) {
  return bmoniRequest<BmoniResponse>("GET", `/v1/users/${userId}/smart-wallets/proposals/${proposalId}/sign-payload`)
}

export async function signProposal(userId: string, proposalId: string, signature: string) {
  return bmoniRequest<BmoniResponse>("POST", `/v1/users/${userId}/smart-wallets/proposals/${proposalId}/sign`, {
    signature,
  })
}

export async function getProposal(userId: string, proposalId: string) {
  return bmoniRequest<BmoniResponse>("GET", `/v1/users/${userId}/smart-wallets/proposals/${proposalId}`)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const TERMINAL_PROPOSAL_STATUSES = ["COMPLETED", "FAILED", "REJECTED", "EXPIRED", "CANCELLED"]

export async function pollProposalStatus(
  userId: string,
  proposalId: string,
  opts?: { intervalMs?: number; timeoutMs?: number }
) {
  const interval = opts?.intervalMs ?? 3000
  const timeout = opts?.timeoutMs ?? 60_000
  const start = Date.now()

  while (Date.now() - start < timeout) {
    const proposal = await getProposal(userId, proposalId)
    const status = String(proposal?.data?.status ?? proposal?.status ?? "")
    if (TERMINAL_PROPOSAL_STATUSES.includes(status)) return proposal
    await sleep(interval)
  }
  throw new Error(`Proposal ${proposalId} did not reach a terminal status within ${timeout}ms`)
}

// Signs whatever shape the sign-payload endpoint returns. Exact shape is
// unconfirmed — tries EIP-712 typed data first (domain/types/message, the
// convention the docs' "sign the EIP-712 payload" language implies), then
// falls back to a raw hash or plain message if that's what comes back.
// Logs the raw payload either way so the real shape is visible on first run.
export async function signProposalPayload(ownerPrivateKey: Hex, payload: BmoniResponse): Promise<string> {
  const account = privateKeyToAccount(ownerPrivateKey)
  const body = payload?.data ?? payload

  if (body?.domain && body?.types && body?.message) {
    return account.signTypedData({
      domain: body.domain,
      types: body.types,
      primaryType: body.primaryType,
      message: body.message,
    })
  }
  if (body?.hash) {
    return account.sign({ hash: body.hash })
  }
  if (typeof body?.message === "string") {
    return account.signMessage({ message: body.message })
  }
  throw new Error(
    `Unrecognized sign-payload shape, can't tell how to sign it: ${JSON.stringify(payload)}. ` +
      `Update signProposalPayload() in lib/bmoni.ts once the real shape is known.`
  )
}

// Runs the full propose -> sign-payload -> sign -> poll cycle for a proposal
// that's already been created (i.e. call this with the proposalId from an
// offramp/transfer/etc response).
export async function signAndCompleteProposal(userId: string, proposalId: string, ownerPrivateKey: Hex) {
  const signPayload = await getProposalSignPayload(userId, proposalId)
  const signature = await signProposalPayload(ownerPrivateKey, signPayload)
  await signProposal(userId, proposalId, signature)
  return pollProposalStatus(userId, proposalId)
}

// ---------------------------------------------------------------------------
// Wallet -> wallet cNGN transfer (payDues)
// STILL UNCONFIRMED — not in the public docs; details.md explicitly flags
// this as "endpoint from BMONI desk". Given the offramp flow above returns
// a proposal rather than completing in one call, a plain transfer almost
// certainly follows the same propose -> sign -> poll pattern (wired via
// signAndCompleteProposal above) — but the *create proposal* call itself
// (path + body) is still a guess. Verify with BMONI staff before relying
// on this.
// ---------------------------------------------------------------------------

export async function createTransferProposal(params: {
  userId: string
  smartWalletId: string
  toAddress: string
  amount: string
}) {
  return bmoniRequest<BmoniResponse>("POST", `/v1/users/${params.userId}/smart-wallets/${params.smartWalletId}/transfer`, {
    currency: "CNGN",
    toAddress: params.toAddress,
    fromAmount: params.amount,
  })
}

export async function transferCngn(params: {
  userId: string
  smartWalletId: string
  toAddress: string
  amount: string
  ownerPrivateKey: Hex
}) {
  const proposal = await createTransferProposal(params)
  const proposalId: string = proposal?.data?.proposalId ?? proposal?.proposalId
  if (!proposalId) {
    throw new Error(`No proposalId in transfer response: ${JSON.stringify(proposal)}`)
  }
  return signAndCompleteProposal(params.userId, proposalId, params.ownerPrivateKey)
}

// ---------------------------------------------------------------------------
// Deposits (NGN -> cNGN) — incoming bank transfers land on a virtual account
// (issued during start-nigeria) and credit the smart wallet as CNGN.
// NOT on this project's critical path: per details.md §7, sandbox wallets
// are funded directly by BMONI staff per phone number, not via bank
// transfer, so provisionAccount() doesn't call these. bankAccountId here
// 400s as "must be a UUID" against the pooled deposit account's own id
// ("pooled-vba-1") — it likely wants a *registered withdrawal account* id
// (from registerWithdrawalAccount) instead, but that's unconfirmed.
// ---------------------------------------------------------------------------

export async function pointDepositsToWallet(userId: string, smartWalletId: string, bankAccountId: string) {
  return bmoniRequest<BmoniResponse>("POST", `/v1/users/${userId}/smart-wallets/${smartWalletId}/onramp/vba/nigeria`, {
    bankAccountId,
  })
}

export async function unpointDepositsFromWallet(userId: string, smartWalletId: string) {
  return bmoniRequest<BmoniResponse>("DELETE", `/v1/users/${userId}/smart-wallets/${smartWalletId}/onramp/vba/nigeria`)
}

// The number the user actually transfers to.
export async function getNgnDepositAccount(userId: string) {
  return bmoniRequest<BmoniResponse>("GET", `/v1/users/${userId}/bank-accounts/deposit-accounts/NGN`)
}

// ---------------------------------------------------------------------------
// Withdrawals (cNGN/USDB -> Nigerian bank) — payout chain (§5.6)
// ---------------------------------------------------------------------------

export async function listNigerianBanks(userId: string) {
  return bmoniRequest<BmoniResponse>("GET", `/v1/users/${userId}/bank-accounts/nigerian-banks`)
}

export async function verifyNigerianAccount(userId: string, params: { accountNumber: string; bankCode: string }) {
  return bmoniRequest<BmoniResponse>("POST", `/v1/users/${userId}/bank-accounts/verify-nigerian-account`, params)
}

// Get-or-create: calling again with the same account returns the existing
// record rather than duplicating it. Response's `id` is the bankAccountId
// createOfframpProposal() needs.
export async function registerWithdrawalAccount(
  userId: string,
  params: { accountNumber: string; bankCode: string; bankName: string; accountHolderName: string }
) {
  return bmoniRequest<BmoniResponse>("POST", `/v1/users/${userId}/bank-accounts/withdrawal-accounts/nigeria`, params)
}

// Returns a proposal (PENDING_APPROVALS), not a completed payout — pair with
// signAndCompleteProposal() to actually execute it.
export async function createOfframpProposal(
  userId: string,
  smartWalletId: string,
  params: { bankAccountId: string; fromAmount: string }
) {
  return bmoniRequest<BmoniResponse>("POST", `/v1/users/${userId}/smart-wallets/${smartWalletId}/offramp/nigeria`, params)
}

// Full withdrawal: create the offramp proposal and drive it to completion.
export async function offrampNigeria(
  userId: string,
  smartWalletId: string,
  params: { bankAccountId: string; fromAmount: string; ownerPrivateKey: Hex }
) {
  const proposal = await createOfframpProposal(userId, smartWalletId, {
    bankAccountId: params.bankAccountId,
    fromAmount: params.fromAmount,
  })
  const proposalId: string = proposal?.data?.proposalId ?? proposal?.proposalId
  if (!proposalId) {
    throw new Error(`No proposalId in offramp response: ${JSON.stringify(proposal)}`)
  }
  return signAndCompleteProposal(userId, proposalId, params.ownerPrivateKey)
}

// ---------------------------------------------------------------------------
// provisionAccount() — full lifecycle orchestrator (Build Order step 1)
// ---------------------------------------------------------------------------

export interface ProvisionInput {
  name: string
  phone: string
  email?: string
  dateOfBirth?: string // defaults to a sandbox placeholder if omitted
}

export interface ProvisionResult {
  bmoniUserId: string
  walletId: string
  walletAddress: string
  ownerPrivateKey: Hex // caller encrypts this before persisting (lib/encryption.ts)
}

// Sandbox test BVN — always verifies successfully, never a real BVN (details.md §9).
const SANDBOX_BVN = "22222222222"

export async function provisionAccount(input: ProvisionInput): Promise<ProvisionResult> {
  console.log(`\n=== provisionAccount: ${input.name} (${input.phone}) ===`)

  const owner = generateOwnerWallet()
  console.log(`[bmoni] generated owner wallet ${owner.address}`)

  const user = await createBmoniUser(input)
  const userId: string = user?.user?.bmoniUserId ?? user?.user?.id
  if (!userId) {
    throw new Error(`Could not find bmoniUserId/id in user creation response: ${JSON.stringify(user)}`)
  }
  console.log(`[bmoni] created user — id=${user?.user?.id} bmoniUserId=${user?.user?.bmoniUserId}`)

  const challenge = await createOwnerProofChallenge(userId, owner.address)
  const challengeId: string = challenge?.challengeId
  const challengeMessage = extractChallengeMessage(challenge)
  const signature = await signOwnerProof(owner.privateKey, challengeMessage)
  console.log(`[bmoni] signed owner-proof challenge ${challengeId}`)

  const wallet = await createManagedSmartWallet(userId, {
    ownerAddress: owner.address,
    signature,
    challengeId,
  })
  const walletId = extractId(wallet)
  const walletAddress = extractWalletAddress(wallet) ?? owner.address

  await getKycOptions(userId)

  // Sandbox has no "Student" occupation — searchOccupations() returns an
  // empty array for "student". "Unemployed" (999999) is the closest generic
  // fit; employmentStatus already records "student" separately.
  const occupations = await searchOccupations(userId, "unemployed")
  const occupationCode: string = occupations?.[0]?.id ?? occupations?.[0]?.socCode ?? "999999"
  console.log(`[bmoni] using occupationCode=${occupationCode}`)

  // Confirmed with BMONI: document uploads (identification/proof-of-address/
  // biometric) are NOT part of the Nigeria BVN-based rail — that's the
  // sumsub-verified flow for USD/EUR/CAD. Nigeria's KYC is just personalInfo
  // + address + identificationNumbers (bvn) below, then start-nigeria.

  await patchKyc(userId, {
    personalInfo: {
      firstName: splitName(input.name).firstName,
      lastName: splitName(input.name).lastName,
      phoneNumber: input.phone,
      dateOfBirth: input.dateOfBirth ?? "2000-01-01",
    },
    address: {
      streetLine1: "1 Test Street",
      city: "Lagos",
      state: "Lagos",
      postalCode: "100001",
      countryCode: "NGA",
    },
    employment: {
      employmentStatus: "student",
      occupationCode,
    },
    sourceOfFunds: "savings",
    estimatedMonthlyVolume: 100,
    accountPurpose: "personal",
    identificationNumbers: [{ type: "bvn", number: SANDBOX_BVN, issuingCountryCode: "NGA" }],
  })

  // getKycReadiness/activateKyc are the generic sumsub-verified rail's
  // gate (USD/EUR/CAD) — not part of Nigeria's BVN-based flow, so skipped
  // here. start-nigeria itself verifies the BVN and activates the rail.
  await startNigeriaOnboarding(userId, {
    bvn: SANDBOX_BVN,
    ngnWalletAddress: walletAddress,
    ngnWalletIndex: 0,
  })
  await checkOnboardingStatus(userId)

  // Deposit-account routing (pointDepositsToWallet) is deliberately not
  // called here — see the "Deposits" section comment above. Sandbox wallets
  // are funded directly by BMONI staff per phone number (details.md §7).

  console.log(`\n=== provisionAccount complete: userId=${userId} walletId=${walletId} ===`)

  return {
    bmoniUserId: userId,
    walletId,
    walletAddress,
    ownerPrivateKey: owner.privateKey,
  }
}

// ---------------------------------------------------------------------------
// Response-shape helpers
// ---------------------------------------------------------------------------

function extractId(obj: BmoniResponse): string {
  const id = obj?.id ?? obj?.data?.id ?? obj?.userId ?? obj?.data?.userId ?? obj?._id
  if (!id) {
    throw new Error(
      `Could not find an id field in BMONI response: ${JSON.stringify(obj)}. ` +
        `Update extractId() in lib/bmoni.ts once the real response shape is known.`
    )
  }
  return String(id)
}

function extractChallengeMessage(obj: BmoniResponse): string {
  const message = obj?.eip191Message ?? obj?.message ?? obj?.challenge ?? obj?.data?.message
  if (!message) {
    throw new Error(
      `Could not find a challenge message in BMONI response: ${JSON.stringify(obj)}. ` +
        `Update extractChallengeMessage() in lib/bmoni.ts once the real response shape is known.`
    )
  }
  return String(message)
}

function extractWalletAddress(obj: BmoniResponse): string | undefined {
  const address =
    obj?.walletAddress ?? obj?.address ?? obj?.SmartWallet?.address ?? obj?.data?.walletAddress
  return address ? String(address) : undefined
}
