"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons"

import { AuthShell } from "@/components/auth/auth-shell"
import { RoleCards, type AuthRole } from "@/components/auth/role-cards"
import { PasswordInput } from "@/components/auth/password-input"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const LEVELS = ["100L", "200L", "300L", "400L", "500L"]

type Step = "role" | "personal" | "org"

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

  const totalSteps = role === "REP" ? 3 : 2
  const stepNumber = step === "role" ? 1 : step === "personal" ? 2 : 3

  function handlePersonalContinue(e: React.FormEvent) {
    e.preventDefault()
    if (role === "REP") {
      setStep("org")
    } else {
      setLoading(true)
      router.push("/dashboard?role=student")
    }
  }

  function handleOrgSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    router.push("/rep/new-space")
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

  if (step === "personal") {
    return (
      <AuthShell
        title="Tell us about you."
        description={`Step ${stepNumber} of ${totalSteps} — no email verification, no OTP.`}
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

        <form onSubmit={handlePersonalContinue} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" placeholder="e.g. Ifeoma Chukwu" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="matric">Matric number</Label>
            <Input id="matric" name="matric" placeholder="e.g. CSC/2022/0142" required />
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
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className={cn(buttonVariants(), "mt-2 w-full")}
          >
            {loading
              ? "Creating account…"
              : role === "REP"
                ? "Continue"
                : "Create account"}
            {!loading && <HugeiconsIcon icon={ArrowRight02Icon} size={18} />}
          </button>
        </form>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Your department."
      description={`Step ${stepNumber} of ${totalSteps} — where you rep.`}
      footer={SIGN_IN_LINK}
    >
      <button
        type="button"
        onClick={() => setStep("personal")}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-medium text-ink-soft transition-colors duration-300 hover:text-ink cursor-pointer"
      >
        <HugeiconsIcon icon={ArrowLeft02Icon} size={14} />
        Back
      </button>

      <form onSubmit={handleOrgSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="department">Department name</Label>
          <Input
            id="department"
            name="department"
            placeholder="e.g. Computer Science"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="institution">Institution</Label>
          <Input
            id="institution"
            name="institution"
            placeholder="e.g. University of Lagos"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(buttonVariants(), "mt-2 w-full")}
        >
          {loading ? "Creating account…" : "Continue to create a space"}
          {!loading && <HugeiconsIcon icon={ArrowRight02Icon} size={18} />}
        </button>
      </form>
    </AuthShell>
  )
}
