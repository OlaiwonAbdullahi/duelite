import { SpaceDetail } from "@/components/dashboard/space-detail"

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ spaceId: string }>
}) {
  const { spaceId } = await params
  return <SpaceDetail spaceId={spaceId} />
}
