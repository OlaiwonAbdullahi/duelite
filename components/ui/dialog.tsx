"use client"

import { createContext, useContext, type ComponentProps, type ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

interface DialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

function useDialogContext() {
  const context = useContext(DialogContext)
  if (!context) throw new Error("Dialog components must be used within Dialog")
  return context
}

function Dialog({
  open = false,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}) {
  return (
    <DialogContext.Provider value={{ open, setOpen: onOpenChange ?? (() => {}) }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({ onClick, ...props }: ComponentProps<"button">) {
  const { setOpen } = useDialogContext()
  return (
    <button
      type="button"
      data-slot="dialog-trigger"
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setOpen(true)
      }}
    />
  )
}

function DialogClose({ onClick, ...props }: ComponentProps<"button">) {
  const { setOpen } = useDialogContext()
  return (
    <button
      type="button"
      data-slot="dialog-close"
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setOpen(false)
      }}
    />
  )
}

function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: ComponentProps<"div"> & { showClose?: boolean }) {
  const { open, setOpen } = useDialogContext()
  if (!open) return null

  return (
    <div data-slot="dialog-portal">
      <div
        data-slot="dialog-backdrop"
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          data-slot="dialog-content"
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative w-full max-w-md rounded-lg border border-hairline bg-paper p-6 shadow-xl outline-none transition-all duration-300 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className
          )}
          {...props}
        >
          {children}
          {showClose && (
            <DialogClose
              aria-label="Close"
              className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-ink-soft transition-colors duration-300 hover:bg-cloud hover:text-ink cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </DialogClose>
          )}
        </div>
      </div>
    </div>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 pr-8", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function DialogTitle(props: ComponentProps<"h2">) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("text-[18px] font-semibold leading-[1.3] text-ink", props.className)}
      {...props}
    />
  )
}

function DialogDescription(props: ComponentProps<"p">) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-[14px] leading-[1.5] text-ink-soft", props.className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
