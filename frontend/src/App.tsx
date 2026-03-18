import { useState, useCallback, useMemo } from 'react';
import { ChatHeader, ChatViewport, ChatInput, type Message, type ChatModes } from '@/components/chat';
import { DocumentUpload } from '@/components/chat/document-upload';
import { useChat } from '@/hooks/useChat';
import { useDocuments } from '@/hooks/useDocuments';

function App() {
  const { messages: rawMessages, isStreaming, sendMessage, clearMessages } = useChat();
  const { documents, uploading, error, setDocuments, setUploading, setError } = useDocuments();

  const [modes, setModes] = useState<ChatModes>({
    rag: true,
    reasoning: false,
    webSearch: false,
  });

  // Map hook's Message shape to template's Message shape
  const messages: Message[] = useMemo(
    () =>
      rawMessages.map((msg) => ({
        id: String(msg.id),
        role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.text,
        isStreaming: msg.isStreaming,
      })),
    [rawMessages],
  );

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content, modes.rag);
    },
    [sendMessage, modes.rag],
  );

  const handleNewChat = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  const handleUploadStart = useCallback(
    (filename: string) => {
      setError(null);
      setUploading({ filename, progress: 0 });
    },
    [setError, setUploading],
  );

  const handleUploadProgress = useCallback(
    (filename: string, progress: number) => {
      setUploading({ filename, progress });
    },
    [setUploading],
  );

  const handleUploadEnd = useCallback(() => {
    setUploading(null);
  }, [setUploading]);

  const handleError = useCallback(
    (message: string) => {
      setError(message);
    },
    [setError],
  );

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(56,189,248,0.16),transparent_36%),radial-gradient(circle_at_80%_24%,rgba(20,184,166,0.14),transparent_40%),radial-gradient(circle_at_62%_86%,rgba(14,165,233,0.12),transparent_42%)]" />
      <ChatHeader onNewChat={handleNewChat} disabled={isStreaming} />

      <main className="relative z-10 flex-1 min-h-0 p-3 sm:p-4">
        <div className="h-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_22rem] gap-4 min-h-0">
          <section className="min-h-0 flex flex-col rounded-2xl border border-border/40 bg-background/55 backdrop-blur-md">
            <ChatViewport messages={messages} isStreaming={isStreaming} />

            <div className="shrink-0 border-t border-border/30 bg-background/45 backdrop-blur-sm">
              <ChatInput
                onSend={handleSend}
                isLoading={isStreaming}
                modes={modes}
                onModesChange={setModes}
              />
            </div>
          </section>

          <aside className="hidden md:flex min-h-0 flex-col rounded-2xl border border-border/40 bg-background/55 backdrop-blur-md">
            <div className="px-4 py-3 border-b border-border/35">
              <h2 className="text-sm font-semibold tracking-wide text-foreground">Uploaded Documents</h2>
              <p className="text-xs text-muted-foreground mt-1">Upload, review, and remove files used for RAG answers.</p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              <DocumentUpload
                documents={documents}
                uploading={uploading}
                onDocumentsChange={setDocuments}
                onUploadStart={handleUploadStart}
                onUploadProgress={handleUploadProgress}
                onUploadEnd={handleUploadEnd}
                onError={handleError}
                isExpanded={true}
                onToggleExpand={() => {}}
                showToggle={false}
              />

              {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
