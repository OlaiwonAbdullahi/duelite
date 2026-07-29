// AES-256-GCM encryption for BMONI owner private keys at rest.
// KEY_ENCRYPTION_SECRET must be a 32+ char string; it is hashed to a 32-byte key.

import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"

function getKey() {
  const secret = process.env.KEY_ENCRYPTION_SECRET
  if (!secret) throw new Error("KEY_ENCRYPTION_SECRET is not set")
  return crypto.createHash("sha256").update(secret).digest()
}

// Output format: iv:authTag:ciphertext (all hex), so it's a single string column.
export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext.toString("hex")}`
}

export function decryptSecret(payload: string): string {
  const [ivHex, authTagHex, ciphertextHex] = payload.split(":")
  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error("Malformed encrypted payload")
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, "hex"))
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"))
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, "hex")),
    decipher.final(),
  ])
  return plaintext.toString("utf8")
}
