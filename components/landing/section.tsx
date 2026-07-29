import { cn } from "@/lib/utils"

function Section({
  className,
  band = "canvas",
  id,
  children,
}: {
  className?: string
  band?: "canvas" | "cloud"
  id?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 sm:py-20 lg:py-24",
        band === "canvas" ? "bg-canvas" : "bg-cloud"
      )}
    >
      <div className={cn("mx-auto w-full max-w-[1280px] px-6 sm:px-8 lg:px-12", className)}>
        {children}
      </div>
    </section>
  )
}

export { Section }
