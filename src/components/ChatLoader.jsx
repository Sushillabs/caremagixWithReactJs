export default function ChatLoader() {
  return (
    <div className="flex items-center gap-1 py-1" aria-label="Thinking" role="status">
      <span className="text-gray-400">Thinking</span>
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: "0ms" }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: "150ms" }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: "300ms" }} />
    </div>
  );
}
