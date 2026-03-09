import { useMessages } from "./hooks";

interface MessageListProps {
  conversationId: string;
}

const roleStyles: Record<string, string> = {
  user: "bg-primary/10 ml-12",
  assistant: "bg-muted mr-12",
  system: "bg-muted/50 text-muted-foreground text-xs italic mx-12",
};

const roleLabels: Record<string, string> = {
  user: "You",
  assistant: "Assistant",
  system: "System",
};

export function MessageList({ conversationId }: MessageListProps) {
  const { data: messages, isLoading, error } = useMessages(conversationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-destructive">Failed to load messages</p>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          No messages yet. Start the conversation below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`rounded-lg p-4 ${roleStyles[msg.role] ?? "bg-muted"}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              {roleLabels[msg.role] ?? msg.role}
            </span>
          </div>
          <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
        </div>
      ))}
    </div>
  );
}
