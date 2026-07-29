import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "font-sans text-[13px] font-medium leading-[1.4] text-ink",
        className
      )}
      {...props}
    />
  )
}

export { Label }
