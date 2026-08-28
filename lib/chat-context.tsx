"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";

import { getSupabaseBrowser } from "@/lib/supabase-client";

export type ChatMessage = {
  id: string;
  senderRole: "customer" | "assistant" | "admin";
  body: string;
  createdAt: string;
};

type ChatContextValue = {
  messages: ChatMessage[];
  unreadCount: number;
  loading: boolean;
  sendMessage: (body: string) => Promise<void>;
  markRead: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channelKey, setChannelKey] = useState<string | null>(null);
  const [lastReadAt, setLastReadAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/backend/me/chat");
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages ?? []);
    setChannelKey(data.conversation?.channelKey ?? null);
    setLastReadAt((prev) => prev ?? data.conversation?.customerLastReadAt ?? null);
  }, []);

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      setChannelKey(null);
      return;
    }
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [userId, load]);

  useEffect(() => {
    if (!channelKey) return;
    const supabase = getSupabaseBrowser();
    const channel = supabase.channel(`chat:${channelKey}`);
    channel.on("broadcast", { event: "message" }, () => void load()).subscribe();
    return () => void supabase.removeChannel(channel);
  }, [channelKey, load]);

  const sendMessage = useCallback(
    async (body: string) => {
      const res = await fetch("/api/backend/me/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) await load();
    },
    [load],
  );

  const markRead = useCallback(() => {
    setLastReadAt(new Date().toISOString());
    void fetch("/api/backend/me/chat/read", { method: "PATCH" });
  }, []);

  const unreadCount = messages.filter(
    (m) => m.senderRole !== "customer" && (!lastReadAt || m.createdAt > lastReadAt),
  ).length;

  const value: ChatContextValue = { messages, unreadCount, loading, sendMessage, markRead };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
}
