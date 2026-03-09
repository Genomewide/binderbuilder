interface StreamingMessageProps {
  text: string;
}

export function StreamingMessage({ text }: StreamingMessageProps) {
  return (
    <div className="rounded-lg bg-muted mr-12 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-muted-foreground">
          Assistant
        </span>
      </div>
      <div className="text-sm whitespace-pre-wrap">
        {text}
        <span className="inline-block w-2 h-4 ml-0.5 bg-foreground/70 animate-pulse" />
      </div>
    </div>
  );
}
