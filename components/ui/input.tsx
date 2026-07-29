import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, ...props }: InputPrimitive.Props) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        "h-12 w-full rounded-lg border border-hairline bg-canvas px-4 font-sans text-[15px] text-ink outline-none transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] placeholder:text-ink-soft focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
