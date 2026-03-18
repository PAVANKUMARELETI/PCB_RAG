import { useCallback, useEffect, useRef, useState } from "react"
import { ChatMessage, type Message } from "./chat-message"
import { ArrowDown, Sparkles } from "lucide-react"

interface ChatViewportProps {
  messages: Message[]
  isStreaming: boolean
}

export function ChatViewport({ messages, isStreaming }: ChatViewportProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(0)
  const [userNearBottom, setUserNearBottom] = useState(true)

  const isNearBottom = (el: HTMLDivElement, threshold = 96) => {
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    return distanceFromBottom <= threshold
  }

  const updateNearBottomState = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    setUserNearBottom(isNearBottom(el))
  }, [])

  const jumpToLatest = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollContainerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
    setUserNearBottom(true)
  }, [])

  useEffect(() => {
    const viewportEl = scrollContainerRef.current
    if (!viewportEl) {
      prevMessageCountRef.current = messages.length
      return
    }

    const hasNewMessage = messages.length > prevMessageCountRef.current
    const shouldStickToBottom = hasNewMessage || userNearBottom

    if (shouldStickToBottom) {
      jumpToLatest(hasNewMessage ? "smooth" : "auto")
    }

    prevMessageCountRef.current = messages.length
  }, [messages, userNearBottom, jumpToLatest])

  useEffect(() => {
    if (messages.length === 0) {
      setUserNearBottom(true)
      prevMessageCountRef.current = 0
    }
  }, [messages.length])

  if (messages.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={scrollContainerRef}
        onScroll={updateNearBottomState}
        className="h-full overflow-y-auto px-4"
      >
        <div className="max-w-4xl mx-auto py-8 space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </div>

      {isStreaming && !userNearBottom && (
        <button
          type="button"
          onClick={() => jumpToLatest()}
          className="absolute bottom-5 right-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/90 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-sm transition hover:bg-background"
        >
          <ArrowDown className="h-3.5 w-3.5" />
          Jump to latest
        </button>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Official Logos */}
        <div className="flex items-center justify-center gap-4">
          <img
            src="/uppcb_logo.png"
            alt="UPPCB"
            className="h-14 w-14 rounded-lg border border-border bg-white object-contain p-1"
          />
          <img
            src="/up_govt_png.webp"
            alt="Government of Uttar Pradesh"
            className="h-14 w-14 rounded-lg border border-border bg-white object-contain p-1"
          />
        </div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-foreground tracking-tight text-balance">
            Welcome to PCB_RAG_AI
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto text-pretty">
            Ask questions on official UPPCB documents with retrieval-augmented answers.
          </p>
        </div>

        {/* Capabilities */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {capabilities.map((cap, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{cap.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {cap.description}
              </p>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="pt-4">
          <p className="text-xs text-muted-foreground mb-3">Try asking:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                className="px-4 py-2 text-sm text-foreground/80 bg-secondary/50 hover:bg-secondary border border-border/50 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const capabilities = [
  {
    title: "Document Q&A",
    description: "Upload official circulars, notices, and policy documents.",
  },
  {
    title: "Reliable Retrieval",
    description: "Answers are generated from uploaded documents with source context.",
  },
  {
    title: "Official Use",
    description: "Designed for a simple and formal public information workflow.",
  },
]

const suggestions = [
  "Summarize the latest air consent guidelines",
  "What are the required documents for consent to establish?",
  "List key compliance dates mentioned in this circular",
  "Show important points from hazardous waste rules",
]
