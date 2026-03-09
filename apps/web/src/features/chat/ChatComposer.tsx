import { useState, useCallback, type FormEvent, type KeyboardEvent } from "react";
import { useSendMessage } from "./hooks";

interface ChatComposerProps {
  conversationId: string;
}

export function ChatComposer({ conversationId }: ChatComposerProps) {
  const [input, setInput] = useState("");
  const sendMessage = useSendMessage(conversationId);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || sendMessage.isPending) return;

      setInput("");
      sendMessage.mutate({ content: trimmed });
    },
    [input, sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as FormEvent);
      }
    },
    [handleSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-shrink-0 border-t border-border p-4"
    >
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={sendMessage.isPending}
        />
        <button
          type="submit"
          disabled={!input.trim() || sendMessage.isPending}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {sendMessage.isPending ? "Sending..." : "Send"}
        </button>
      </div>
      {sendMessage.isError && (
        <p className="mt-2 text-xs text-destructive">
          Failed to send message. Please try again.
        </p>
      )}
    </form>
  );
}
