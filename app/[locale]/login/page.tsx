import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/sections/LoginForm";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return { title: t("title"), description: t("subtitle") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
  const alt = await getTranslations("imageAlt");
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID);
  const facebookEnabled = Boolean(process.env.FACEBOOK_CLIENT_ID);

  return (
    <AuthShell namespace="auth.login" image="/images/about-1-v2.png" imageAlt={alt("about1")}>
      <LoginForm googleEnabled={googleEnabled} facebookEnabled={facebookEnabled} />
      <div className="mt-6 flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <Link href="/forgot-password" className="hover:text-foreground">
          {t("forgotPassword")}
        </Link>
        <p>
          {t("noAccount")}{" "}
          <Link href="/register" className="font-medium text-gold-600 hover:text-gold-700">
            {t("signUp")}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
