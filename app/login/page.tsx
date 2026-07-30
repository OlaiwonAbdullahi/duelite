"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight02Icon, Alert01Icon } from "@hugeicons/core-free-icons"

import { AuthShell } from "@/components/auth/auth-shell"
import { PasswordInput } from "@/components/auth/password-input"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import { apiFetch, ApiError } from "@/lib/api-client"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          phone: form.get("phone"),
          password: form.get("password"),
        }),
      })
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.")
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back."
      description="Sign in to keep your dues moving cleanly."
      footer={
        <>
          New to Duelite?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
          {loading ? "Signing in…" : "Sign in"}
          {!loading && <HugeiconsIcon icon={ArrowRight02Icon} size={18} />}
        </button>
      </form>
    </AuthShell>
  )
}
