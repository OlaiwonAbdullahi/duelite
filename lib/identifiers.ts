import { prisma } from "@/lib/prisma"

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no O/0/I/1 ambiguity
const JOIN_CODE_LENGTH = 5

function randomCode(length: number) {
  return Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("")
}

// Random 5-character join code (letters + digits), retrying on the rare collision.
export async function generateJoinCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode(JOIN_CODE_LENGTH)
    const existing = await prisma.space.findUnique({ where: { joinCode: code } })
    if (!existing) return code
  }
  throw new Error("Could not generate a unique join code")
}

// Spaces need their own BMONI identity, which requires a unique phone number
// — but a department isn't a person with a phone. Generates a synthetic one.
export function generateSyntheticPhone(): string {
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join("")
  return `+234${digits}`
}

// Canonicalizes any Nigerian phone input ("0801...", "+234801...", "234801...")
// to "+234801..." — matching generateSyntheticPhone()'s format above (also
// what gets sent to BMONI as the user's phoneNumber) and Twilio's WhatsApp
// `From` field, so incoming messages can be matched with a plain findUnique.
export function normalizeNigerianPhone(input: string): string {
  const digits = input.replace(/\D/g, "")
  if (digits.startsWith("234")) return `+${digits}`
  if (digits.startsWith("0")) return `+234${digits.slice(1)}`
  if (digits.length === 10) return `+234${digits}`
  return `+${digits}`
}
