import Link from "next/link"

function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col bg-canvas">
      <div className="p-6 sm:p-8">
        <Link href="/" className="inline-flex items-center gap-2 cursor-pointer">
          <span className="text-[18px] font-semibold tracking-tight text-ink">
            Duelite.
          </span>
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 text-center">
            <h1 className="text-[26px] font-semibold leading-[1.2] text-ink">
              {title}
            </h1>
            <p className="mt-2 text-[14px] leading-[1.5] text-ink-soft">
              {description}
            </p>
          </div>
          <div className="rounded-lg border border-hairline bg-paper p-6 sm:p-8">
            {children}
          </div>
          <div className="mt-6 text-center text-[14px] leading-[1.5] text-ink-soft">
            {footer}
          </div>
        </div>
      </div>
    </main>
  )
}

export { AuthShell }
