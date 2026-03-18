import { Button } from "@/components/ui/button"
import { Plus, History, Settings } from "lucide-react"

interface ChatHeaderProps {
  onNewChat: () => void
  disabled?: boolean
}

export function ChatHeader({ onNewChat, disabled }: ChatHeaderProps) {
  return (
    <header className="shrink-0 h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <img
            src="/uppcb_logo.png"
            alt="UPPCB Logo"
            className="h-9 w-9 rounded-md border border-border bg-white object-contain p-0.5"
          />
          <div>
            <h1 className="font-semibold text-foreground tracking-tight">PCB_RAG_AI</h1>
            <p className="text-xs text-muted-foreground">Uttar Pradesh Pollution Control Board</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <img
            src="/up_govt_png.webp"
            alt="Government of Uttar Pradesh"
            className="hidden sm:block h-9 w-9 rounded-md border border-border bg-white object-contain p-0.5"
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <History className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">History</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            disabled={disabled}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
