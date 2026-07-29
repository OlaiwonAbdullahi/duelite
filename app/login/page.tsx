"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight02Icon } from "@hugeicons/core-free-icons"

import { AuthShell } from "@/components/auth/auth-shell"
import { PasswordInput } from "@/components/auth/password-input"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    router.push("/dashboard")
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
          <Label htmlFor="email">Email address</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-[13px] font-medium text-primary hover:underline">
              Forgot?
            </a>
          </div>
          <PasswordInput id="password" name="password" placeholder="••••••••" required />
        </div>

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
