"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useChat } from "@/lib/chat-context";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const { data: session } = useSession();
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const { messages, unreadCount, sendMessage, markRead } = useChat();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) markRead();
  }, [open, markRead]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);

  if (!session?.user) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setDraft("");
    await sendMessage(body);
    setSending(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("openLabel")}
        className="fixed bottom-6 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 rtl:left-6 ltr:right-6"
      >
        <MessageCircle className="size-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-semibold text-destructive-foreground rtl:-left-1 ltr:-right-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="flex w-full flex-col border-none bg-background p-0 sm:max-w-sm"
        >
          <SheetTitle className="sr-only">{t("title")}</SheetTitle>

          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <span className="font-heading text-lg text-foreground">{t("title")}</span>
            <SheetClose
              render={
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted" aria-label={t("closeLabel")} />
              }
            >
              <X className="size-5" />
            </SheetClose>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                  message.senderRole === "customer"
                    ? "ms-auto bg-primary text-primary-foreground"
                    : "me-auto bg-muted text-foreground",
                )}
              >
                {message.body}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border/70 px-4 py-3">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t("placeholder")}
              className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
            <Button type="submit" size="icon" className="size-10 shrink-0 rounded-full" disabled={sending || !draft.trim()} aria-label={t("send")}>
              <Send className="size-4 rtl:-scale-x-100" />
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
