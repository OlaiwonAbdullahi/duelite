"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      style={
        {
          "--normal-bg": "var(--paper)",
          "--normal-text": "var(--ink)",
          "--normal-border": "var(--hairline)",
          "--success-bg": "var(--paper)",
          "--success-text": "var(--primary)",
          "--success-border": "var(--hairline)",
          "--error-bg": "var(--paper)",
          "--error-text": "var(--destructive)",
          "--error-border": "var(--hairline)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
