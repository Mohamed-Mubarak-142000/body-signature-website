"use client";

import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useRouter } from "@/i18n/navigation";

type FormErrors = Partial<Record<"name" | "email" | "password", string>>;

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const t = useTranslations("auth.register");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const schema = z.object({
    name: z.string().trim().min(1, t("errors.nameRequired")),
    email: z.string().trim().min(1, t("errors.emailInvalid")).email(t("errors.emailInvalid")),
    password: z.string().min(8, t("errors.passwordTooShort")),
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = schema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitError(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (!res.ok) throw new Error("register failed");
      router.push(`/verify-email?email=${encodeURIComponent(result.data.email)}`);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogle() {
    setGoogleSubmitting(true);
    void signIn("google");
  }

  const busy = submitting || googleSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input
          id="name"
          name="name"
          placeholder={t("namePlaceholder")}
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          className="h-11 px-3"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          className="h-11 px-3"
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder={t("passwordPlaceholder")}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          className="h-11"
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      {submitError && <p className="text-sm text-destructive">{t("errors.submitFailed")}</p>}

      <Button type="submit" size="lg" className="h-11 w-full text-sm" disabled={busy}>
        {submitting ? t("sending") : t("submit")}
      </Button>

      {googleEnabled && (
        <>
          <div className="relative py-2 text-center text-xs text-muted-foreground">
            <span className="bg-card px-2">{tAuth("orDivider")}</span>
            <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11 w-full text-sm"
            disabled={busy}
            onClick={handleGoogle}
          >
            {googleSubmitting ? tAuth("redirecting") : tAuth("googleCta")}
          </Button>
        </>
      )}
    </form>
  );
}
