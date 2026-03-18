import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send } from "lucide-react"
import { ModeToggle, type ChatModes } from "./mode-toggle"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  modes: ChatModes
  onModesChange: (modes: ChatModes) => void
}

export function ChatInput({
  onSend,
  isLoading,
  modes,
  onModesChange,
}: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const hasActiveMode = modes.rag || modes.reasoning || modes.webSearch

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
      {/* Glassmorphism Input Container */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          "glass rounded-2xl p-1.5 transition-all duration-300",
          hasActiveMode && "ring-1 ring-primary/20"
        )}>
          <div className="flex flex-col">
            {/* Mode Toggles Row */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
              <ModeToggle modes={modes} onModesChange={onModesChange} />
            </div>

            {/* Input Row */}
            <div className="flex items-end gap-2 p-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                disabled={isLoading}
                rows={1}
                className={cn(
                  "flex-1 min-h-[48px] max-h-[200px] resize-none",
                  "bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                  "text-foreground placeholder:text-muted-foreground/60",
                  "py-3 px-2 text-base leading-relaxed"
                )}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "h-12 w-12 rounded-xl shrink-0 transition-all duration-200",
                  "bg-primary hover:bg-primary/90",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  input.trim() && !isLoading && "animate-glow-pulse"
                )}
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Input hint */}
        <p className="text-center text-xs text-muted-foreground/60 mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>

        {isLoading && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="font-medium">Generating answer, please wait...</span>
          </div>
        )}
      </form>
    </div>
  )
}
