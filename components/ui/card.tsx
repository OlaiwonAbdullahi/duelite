import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-lg border border-hairline bg-canvas p-6",
        className
      )}
      {...props}
    />
  )
}

export { Card }
