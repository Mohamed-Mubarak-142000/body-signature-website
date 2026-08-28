"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";

export function BookingForm({ serviceId }: { serviceId: string }) {
  const t = useTranslations("services.booking");
  const router = useRouter();
  const [requestedAt, setRequestedAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [minDate] = useState(() => new Date(Date.now() + 60 * 60 * 1000));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!requestedAt) return;

    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/backend/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId, requestedAt: new Date(requestedAt).toISOString() }),
    });

    if (res.status === 401 || res.status === 403) {
      router.push("/login");
      return;
    }

    setSubmitting(false);
    if (!res.ok) {
      setError(t("errors.submitFailed"));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div role="status" className="rounded-2xl border border-gold-300/60 bg-gold-100/40 p-6">
        <h3 className="font-heading text-lg text-foreground">{t("successTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("successBody")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border/70 bg-card p-6">
      <h3 className="font-heading text-lg text-foreground">{t("title")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-4 space-y-2">
        <Label htmlFor="requestedAt">{t("preferredTime")}</Label>
        <DateTimePicker
          id="requestedAt"
          value={requestedAt}
          onChange={setRequestedAt}
          min={minDate}
          placeholder={t("preferredTime")}
          timeLabel={t("selectTime")}
        />
      </div>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="mt-4 w-full" disabled={submitting}>
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {submitting ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
