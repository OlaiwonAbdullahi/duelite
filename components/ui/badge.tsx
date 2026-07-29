import { cn } from "@/lib/utils"

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-cloud px-2.5 py-1 font-sans text-[13px] font-medium leading-[1.4] text-primary",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
