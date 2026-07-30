"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon, ArrowRight02Icon, Alert01Icon } from "@hugeicons/core-free-icons"

import { AuthShell } from "@/components/auth/auth-shell"
import { RoleCards, type AuthRole } from "@/components/auth/role-cards"
import { PasswordInput } from "@/components/auth/password-input"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { buttonVariants } from "@/components/ui/button"
import { apiFetch, ApiError } from "@/lib/api-client"
import { cn } from "@/lib/utils"

const LEVELS = ["100L", "200L", "300L", "400L", "500L"]

type Step = "role" | "personal"

const SIGN_IN_LINK = (
  <>
    Already have an account?{" "}
    <Link href="/login" className="font-medium text-primary hover:underline">
      Sign in
    </Link>
  </>
)

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("role")
  const [role, setRole] = useState<AuthRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePersonalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    try {
      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          password: form.get("password"),
          role,
          level: role === "STUDENT" ? form.get("level") : undefined,
        }),
      })
      router.push(role === "REP" ? "/rep/new-space" : "/dashboard")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.")
      setLoading(false)
    }
  }

  if (step === "role") {
    return (
      <AuthShell
        title="Create your account."
        description="Step 1 of 2 — how will you be using Duelite?"
        footer={SIGN_IN_LINK}
      >
        <div className="flex flex-col gap-5">
          <RoleCards value={role} onChange={setRole} />
          <button
            type="button"
            disabled={!role}
            onClick={() => setStep("personal")}
            className={cn(buttonVariants(), "w-full")}
          >
            Continue
            <HugeiconsIcon icon={ArrowRight02Icon} size={18} />
          </button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Tell us about you."
      description="Step 2 of 2 — no email verification, no OTP."
      footer={SIGN_IN_LINK}
    >
      <button
        type="button"
        onClick={() => setStep("role")}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-medium text-ink-soft transition-colors duration-300 hover:text-ink cursor-pointer"
      >
        <HugeiconsIcon icon={ArrowLeft02Icon} size={14} />
        Change role
      </button>

      <form onSubmit={handlePersonalSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" placeholder="e.g. Ifeoma Chukwu" required />
        </div>

        {role === "STUDENT" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="level">Level</Label>
            <Select id="level" name="level" defaultValue="" required>
              <option value="" disabled>
                Select your level
              </option>
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="080 1234 5678"
            required
          />
          <span className="text-[12px] leading-[1.4] text-ink-soft">
            This doubles as your WhatsApp identity for Duey.
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" name="password" placeholder="••••••••" required />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-[13px] leading-[1.5] text-destructive">
            <HugeiconsIcon icon={Alert01Icon} size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(buttonVariants(), "mt-2 w-full")}
        >
          {loading
            ? role === "REP"
              ? "Creating account…"
              : "Setting up your wallet…"
            : "Create account"}
          {!loading && <HugeiconsIcon icon={ArrowRight02Icon} size={18} />}
        </button>
      </form>
    </AuthShell>
  )
}
