import Image from "next/image"

import { cn } from "@/lib/utils"

function Avatar({
  name,
  size = 36,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  return (
    <Image
      src={`https://tapback.co/api/avatar/${encodeURIComponent(name)}.webp`}
      alt={name}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  )
}

export { Avatar }
