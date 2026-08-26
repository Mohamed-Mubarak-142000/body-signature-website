"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CheckCircle2, Heart, ShoppingBag, X, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export const toastManager = ToastPrimitive.createToastManager();

const TOAST_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  cart: ShoppingBag,
  wishlist: Heart,
  success: CheckCircle2,
  error: XCircle,
};

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toast) => {
    const Icon = TOAST_ICONS[toast.type ?? "success"] ?? CheckCircle2;
    return (
      <ToastPrimitive.Root
        key={toast.id}
        toast={toast}
        className={cn(
          "pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-border/70 bg-card p-4 text-sm shadow-lg transition-all duration-200",
          "data-starting-style:translate-y-2 data-starting-style:opacity-0",
          "data-ending-style:translate-y-2 data-ending-style:opacity-0",
          "data-[type=error]:border-destructive/30 data-[type=error]:bg-destructive/5",
        )}
      >
        <Icon
          className={cn(
            "mt-0.5 size-4 shrink-0",
            toast.type === "error" ? "text-destructive" : "text-gold-600",
          )}
        />
        <div className="min-w-0 flex-1">
          <ToastPrimitive.Title className="font-medium text-foreground" />
          {toast.description && (
            <ToastPrimitive.Description className="mt-0.5 text-muted-foreground" />
          )}
        </div>
        <ToastPrimitive.Close
          aria-label="Close"
          className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
    );
  });
}

export function Toaster() {
  return (
    <ToastPrimitive.Provider toastManager={toastManager} limit={3}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed inset-x-4 bottom-4 z-100 mx-auto flex w-full max-w-sm flex-col-reverse gap-2 sm:inset-x-auto sm:end-4">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
