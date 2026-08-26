"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { id: string; name: string | null };
};

function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5 text-gold-500">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={cn(size, star <= Math.round(value) ? "fill-current" : "text-border")} />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={String(star)}
          className="text-gold-500"
        >
          <Star className={cn("size-6 transition-colors", star <= value ? "fill-current" : "text-border")} />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({
  productId,
  reviews,
  average,
  count,
  isSignedIn,
}: {
  productId: string;
  reviews: Review[];
  average: number;
  count: number;
  isSignedIn: boolean;
}) {
  const t = useTranslations("shop.reviews");
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);

    if (rating < 1) {
      setError(t("errors.ratingRequired"));
      return;
    }
    if (comment.trim().length === 0) {
      setError(t("errors.commentRequired"));
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/backend/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });
      if (!res.ok) throw new Error("review submit failed");
      setSuccess(true);
      setRating(0);
      setComment("");
      router.refresh();
    } catch {
      setError(t("errors.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <h2 className="font-heading text-2xl text-foreground">{t("title")}</h2>
        {count > 0 && (
          <>
            <Stars value={average} />
            <span className="text-sm text-muted-foreground">
              {t("averageLabel", { average: average.toFixed(1), count })}
            </span>
          </>
        )}
      </div>

      <div className="mt-8">
        {isSignedIn ? (
          <form onSubmit={handleSubmit} className="max-w-lg space-y-3 border-b border-border/70 pb-8">
            <div>
              <label className="text-sm font-medium text-foreground">{t("yourRating")}</label>
              <div className="mt-1.5">
                <StarPicker value={rating} onChange={setRating} />
              </div>
            </div>
            <div>
              <label htmlFor="review-comment" className="text-sm font-medium text-foreground">
                {t("comment")}
              </label>
              <textarea
                id="review-comment"
                rows={3}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={t("commentPlaceholder")}
                className="mt-1.5 w-full border border-border/70 bg-background px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {success && <p className="text-sm text-gold-600">{t("success")}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? t("sending") : t("submit")}
            </Button>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-3 border-b border-border/70 pb-8 text-sm text-muted-foreground">
            <span>{t("signInPrompt")}</span>
            <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/login" />}>
              {t("signInCta")}
            </Button>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="mt-8 space-y-6">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-border/70 pb-6 last:border-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{review.user.name ?? "—"}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-1">
                <Stars value={review.rating} size="size-3.5" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
