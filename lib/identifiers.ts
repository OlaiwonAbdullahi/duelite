import { prisma } from "@/lib/prisma"

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no O/0/I/1 ambiguity

function randomCode(length: number) {
  return Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("")
}

// Prefers a readable code derived from the space name ("200L CSC Dept" -> "200LCSC"),
// falling back to a random suffix (then a fully random code) on collision.
export async function generateJoinCode(spaceName: string): Promise<string> {
  const prefix = spaceName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8) || "SPACE"

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = attempt === 0 ? prefix : `${prefix}${randomCode(3)}`
    const existing = await prisma.space.findUnique({ where: { joinCode: code } })
    if (!existing) return code
  }
  return randomCode(8)
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
