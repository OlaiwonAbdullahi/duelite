import { redirect } from "next/navigation"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role } = await searchParams
  redirect(role ? `/dashboard/overview?role=${role}` : "/dashboard/overview")
}
