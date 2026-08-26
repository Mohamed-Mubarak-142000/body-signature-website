import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/sections/RegisterForm";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.register");
  return { title: t("title"), description: t("subtitle") };
}

export default async function RegisterPage() {
  const t = await getTranslations("auth.register");
  const alt = await getTranslations("imageAlt");
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID);

  return (
    <AuthShell namespace="auth.register" image="/images/about-2-v2.png" imageAlt={alt("about2")}>
      <RegisterForm googleEnabled={googleEnabled} />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-gold-600 hover:text-gold-700">
          {t("signIn")}
        </Link>
      </p>
    </AuthShell>
  );
}
