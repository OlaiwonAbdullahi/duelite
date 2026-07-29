import { cn } from "@/lib/utils"

function NavLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="nav-link"
      className={cn(
        "cursor-pointer rounded-full bg-paper px-4 py-2 font-sans text-[15px] font-medium leading-none text-ink-soft transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-cloud hover:text-ink",
        className
      )}
      {...props}
    />
  )
}

export { NavLink }
