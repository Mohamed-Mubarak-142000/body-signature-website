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

type FormErrors = Partial<Record<"email" | "password", string>>;

export function LoginForm({
  googleEnabled,
  facebookEnabled,
}: {
  googleEnabled: boolean;
  facebookEnabled: boolean;
}) {
  const t = useTranslations("auth.login");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [facebookSubmitting, setFacebookSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const schema = z.object({
    email: z.string().trim().min(1, t("errors.emailInvalid")).email(t("errors.emailInvalid")),
    password: z.string().min(1),
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = schema.safeParse({
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

    const signInResult = await signIn("credentials", { ...result.data, redirect: false });
    setSubmitting(false);

    if (signInResult?.error) {
      setSubmitError(true);
      return;
    }

    router.push("/account");
  }

  function handleGoogle() {
    setGoogleSubmitting(true);
    void signIn("google");
  }

  function handleFacebook() {
    setFacebookSubmitting(true);
    void signIn("facebook");
  }

  const busy = submitting || googleSubmitting || facebookSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          className="h-11"
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      {submitError && <p className="text-sm text-destructive">{t("errors.invalidCredentials")}</p>}

      <Button type="submit" size="lg" className="h-11 w-full text-sm" disabled={busy}>
        {submitting ? t("sending") : t("submit")}
      </Button>

      {(googleEnabled || facebookEnabled) && (
        <>
          <div className="relative py-2 text-center text-xs text-muted-foreground">
            <span className="bg-card px-2">{tAuth("orDivider")}</span>
            <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
          </div>

          <div className="space-y-3">
            {googleEnabled && (
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
            )}

            {facebookEnabled && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-11 w-full text-sm"
                disabled={busy}
                onClick={handleFacebook}
              >
                {facebookSubmitting ? tAuth("redirecting") : tAuth("facebookCta")}
              </Button>
            )}
          </div>
        </>
      )}
    </form>
  );
}
