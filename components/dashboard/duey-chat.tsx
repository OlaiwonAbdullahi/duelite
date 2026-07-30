"use client"

import { useEffect, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiChat02Icon, Cancel01Icon, SentIcon } from "@hugeicons/core-free-icons"

import { apiFetch, ApiError } from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const GREETING: ChatMessage = {
  role: "assistant",
  content: "I'm Duey. Ask me things like \"how much do I owe\" or \"pay my dues\".",
}

function DueyChat() {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || loaded) return
    setLoaded(true)
    apiFetch<{ messages: ChatMessage[] }>("/api/duey")
      .then((data) => {
        if (data.messages.length > 0) setMessages(data.messages)
      })
      .catch(() => {})
  }, [open, loaded])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, sending])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setMessages((prev) => [...prev, { role: "user", content: text }])
    setInput("")
    setSending(true)

    try {
      const data = await apiFetch<{ reply: string }>("/api/duey", {
        method: "POST",
        body: JSON.stringify({ message: text }),
      })
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong — try again."
      setMessages((prev) => [...prev, { role: "assistant", content: message }])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Duey chat" : "Chat with Duey"}
        className="fixed right-4 bottom-20 z-50 flex size-13 cursor-pointer items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-transform duration-300 hover:scale-105 sm:right-6 sm:bottom-6"
      >
        <HugeiconsIcon icon={open ? Cancel01Icon : AiChat02Icon} size={22} />
      </button>

      {open && (
        <div className="fixed right-4 bottom-36 z-50 flex h-[min(70vh,520px)] w-[min(92vw,360px)] flex-col overflow-hidden rounded-lg border border-hairline bg-canvas shadow-2xl sm:right-6 sm:bottom-24">
          <div className="flex items-center gap-2.5 border-b border-hairline bg-paper px-4 py-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-cloud">
              <HugeiconsIcon icon={AiChat02Icon} size={16} color="var(--primary)" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-ink">Duey</p>
              <p className="text-[11px] text-ink-soft">Your money, explained</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-lg px-3.5 py-2.5 text-[13px] leading-[1.5]",
                  msg.role === "user"
                    ? "self-end bg-primary text-on-primary"
                    : "self-start bg-paper text-ink"
                )}
              >
                {msg.content}
              </div>
            ))}
            {sending && (
              <div className="self-start rounded-lg bg-paper px-3.5 py-2.5 text-[13px] text-ink-soft">
                Duey is typing…
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-hairline p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How much do I owe?"
              disabled={sending}
              className="h-10 flex-1 rounded-full border border-hairline bg-canvas px-4 font-sans text-[13px] text-ink outline-none transition-colors duration-300 placeholder:text-ink-soft focus-visible:border-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send"
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-on-primary transition-opacity duration-300 hover:bg-primary-bright disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HugeiconsIcon icon={SentIcon} size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export { DueyChat }
