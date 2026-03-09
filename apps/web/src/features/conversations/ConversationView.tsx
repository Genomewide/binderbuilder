import { useWorkspaceSelectionStore } from "@baseui/state";
import { useConversation } from "./hooks";
import { MessageList } from "../messages/MessageList";
import { ChatComposer } from "../chat/ChatComposer";
import { StreamingMessage } from "../chat/StreamingMessage";
import { useStreamMessage } from "../chat/hooks";

export function ConversationView() {
  const { activeConversationId } = useWorkspaceSelectionStore();
  const { data: conversation, isLoading } = useConversation(activeConversationId);
  const { streamingText, isStreaming } = useStreamMessage(activeConversationId);

  if (!activeConversationId) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 py-3 border-b border-border">
        <h2 className="text-lg font-semibold">{conversation.title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <MessageList conversationId={conversation.id} />
        {isStreaming && streamingText && (
          <div className="px-6 pb-4">
            <StreamingMessage text={streamingText} />
          </div>
        )}
      </div>
      <ChatComposer conversationId={conversation.id} />
    </div>
  );
}
