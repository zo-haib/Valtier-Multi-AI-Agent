import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Plus } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { LoadingState } from "../components/ui/Feedback";
import { cn } from "../lib/cn";
import { listConversations, sendMessage } from "../services/conversationApi";
import type { Conversation, ConversationMessage } from "../types";
import { useToast } from "../components/ui/Toast";

export function ConversationsPage() {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function refreshConversations(selectId?: string) {
    try {
      const list = await listConversations();
      setConversations(list);
      if (selectId) {
        const match = list.find((c) => c.id === selectId);
        if (match) setMessages(match.messages);
      } else if (list.length > 0 && !activeId) {
        setActiveId(list[0].id);
        setMessages(list[0].messages);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not load conversations.", "error");
      setConversations([]);
    }
  }

  function openConversation(conv: Conversation) {
    setActiveId(conv.id);
    setMessages(conv.messages);
  }

  function startNewConversation() {
    setActiveId(null);
    setMessages([]);
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    const userMessage: ConversationMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: "Just now",
    };
    setMessages((prev) => [...prev, userMessage]);
    const text = input;
    setInput("");
    setSending(true);
    try {
      const { message, conversationId } = await sendMessage(activeId, text);
      setMessages((prev) => [...prev, message]);
      setActiveId(conversationId);
      await refreshConversations(conversationId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Valtier couldn't complete that request.", "error");
      // Roll back the optimistic user message on failure.
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 lg:h-[calc(100vh-6.5rem)]">
      <div>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Conversations</h1>
        <p className="mt-1 text-brand-dark/50">Talk to Valtier — it coordinates the right agents automatically.</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <GlassCard padding="sm" className="hidden min-h-0 flex-col lg:flex">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-brand-dark/40">Recent</span>
            <button onClick={startNewConversation} className="rounded-lg p-1.5 text-brand-dark/50 hover:bg-brand-light hover:text-brand-dark">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto">
            {!conversations ? (
              <LoadingState label="Loading…" />
            ) : conversations.length === 0 ? (
              <p className="px-3 py-4 text-sm text-brand-dark/40">No conversations yet — send a message to start one.</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                    activeId === conv.id ? "bg-brand-dark/5" : "hover:bg-brand-light"
                  )}
                >
                  <span className="w-full truncate text-sm font-medium">{conv.title}</span>
                  <span className="w-full truncate text-xs text-brand-dark/40">{conv.lastMessage}</span>
                </button>
              ))
            )}
          </div>
        </GlassCard>

        {/* Chat */}
        <GlassCard padding="none" className="flex min-h-0 flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-sm text-brand-dark/40">
                Start a new conversation with your AI workforce.
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl border px-4 py-3 text-sm  sm:max-w-[70%]",
                    msg.role === "user"
                      ? "border-brand-dark/15 bg-brand-dark/5 text-brand-dark"
                      : "border-brand-dark/10 bg-brand-light text-brand-dark/80"
                  )}
                >
                  {msg.agentAttribution && (
                    <div className="mb-1.5 flex flex-wrap gap-1">
                      {msg.agentAttribution.map((a) => (
                        <span key={a} className="rounded-full border border-brand-dark/10 bg-brand-dark/5 px-2 py-0.5 text-[10px] text-brand-dark/60">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-brand-dark/10 bg-brand-light px-4 py-3 text-sm text-brand-dark/50">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Coordinating agents…
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-brand-dark/10 p-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Valtier anything about your business…"
              className="flex-1 rounded-xl border border-brand-dark/10 bg-brand-light px-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 outline-none focus:border-brand-dark/30"
            />
            <Button onClick={handleSend} disabled={!input.trim() || sending} size="md">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
