"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon, ArrowRight02Icon, CheckmarkCircle02Icon, UserGroupIcon } from "@hugeicons/core-free-icons"

import { AuthShell } from "@/components/auth/auth-shell"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/dashboard/empty-state"
import { apiFetch, ApiError } from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface AdminUser {
  id: string
  name: string
  phone: string
  level: string | null
  role: "STUDENT" | "REP"
  provisioned: boolean
  provisionError: string | null
  walletAddress: string | null
  createdAt: string
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const [secret, setSecret] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  async function loadUsers() {
    try {
      const data = await apiFetch<{ users: AdminUser[] }>("/api/admin/users")
      setUsers(data.users)
      setLoadError(null)
      setAuthed(true)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthed(false)
      } else {
        setLoadError(err instanceof ApiError ? err.message : "Couldn't load users.")
        setAuthed(false)
      }
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoggingIn(true)
    try {
      await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ secret }),
      })
      setSecret("")
      await loadUsers()
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message : "Something went wrong.")
    } finally {
      setLoggingIn(false)
    }
  }

  if (authed !== true) {
    return (
      <AuthShell title="Admin" description="Enter the admin secret to view signed-up users." footer={null}>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="secret">Admin secret</Label>
            <Input
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="••••••••"
              autoFocus
              required
            />
          </div>

          {(loginError || loadError) && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-[13px] leading-[1.5] text-destructive">
              <HugeiconsIcon icon={Alert01Icon} size={16} className="mt-0.5 shrink-0" />
              <span>{loginError ?? loadError}</span>
            </div>
          )}

          <button type="submit" disabled={loggingIn} className={cn(buttonVariants(), "w-full")}>
            {loggingIn ? "Checking…" : "Enter"}
            {!loggingIn && <HugeiconsIcon icon={ArrowRight02Icon} size={18} />}
          </button>
        </form>
      </AuthShell>
    )
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-[24px] font-semibold text-ink">Signed-up users</h1>
        <p className="mt-1 text-[14px] text-ink-soft">{users.length} accounts total.</p>
      </div>

      {users.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={UserGroupIcon}
            title="No users yet"
            description="Signed-up students and reps will show up here."
          />
        </div>
      ) : (
        <Card className="mt-6 overflow-x-auto p-0">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline">
                <th className="px-4 py-3 text-[12px] font-medium text-ink-soft">Name</th>
                <th className="px-4 py-3 text-[12px] font-medium text-ink-soft">Phone</th>
                <th className="px-4 py-3 text-[12px] font-medium text-ink-soft">Role</th>
                <th className="px-4 py-3 text-[12px] font-medium text-ink-soft">Level</th>
                <th className="px-4 py-3 text-[12px] font-medium text-ink-soft">BMONI</th>
                <th className="px-4 py-3 text-[12px] font-medium text-ink-soft">Wallet address</th>
                <th className="px-4 py-3 text-[12px] font-medium text-ink-soft">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-[13px] font-medium text-ink">{u.name}</td>
                  <td className="px-4 py-3 font-mono text-[13px] text-ink-soft">{u.phone}</td>
                  <td className="px-4 py-3 text-[13px] text-ink-soft">{u.role}</td>
                  <td className="px-4 py-3 text-[13px] text-ink-soft">{u.level ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px]">
                    {u.provisioned ? (
                      <span className="flex items-center gap-1 text-primary">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                        Provisioned
                      </span>
                    ) : (
                      <span className="text-destructive" title={u.provisionError ?? undefined}>
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-ink-soft">
                    {u.walletAddress ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-ink-soft">
                    {new Date(u.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </main>
  )
}
