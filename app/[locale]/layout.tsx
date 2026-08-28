import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Cormorant_Garamond, Inter, Noto_Kufi_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

import { ChatWidget } from "@/components/chat/ChatWidget";
import { PageLoader } from "@/components/effects/PageLoader";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WaveDivider } from "@/components/layout/WaveDivider";
import { Toaster } from "@/components/ui/toast";
import { routing } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";
import { CartProvider } from "@/lib/cart-context";
import { ChatProvider } from "@/lib/chat-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { WishlistProvider } from "@/lib/wishlist-context";

async function getCurrency(): Promise<string> {
  const res = await backendFetch("/api/settings");
  if (!res.ok) return "EUR";
  const settings = await res.json();
  return settings.currency ?? "EUR";
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "brand" });

  return {
    title: `${t("name")} — ${t("tagline")}`,
    description: t("tagline"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = locale === "ar" ? "rtl" : "ltr";
  const isArabic = locale === "ar";
  const [session, currency] = await Promise.all([auth(), getCurrency()]);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${cormorant.variable} ${notoKufiArabic.variable}`}
      style={{
        ["--font-sans" as string]: isArabic
          ? "var(--font-noto-arabic)"
          : "var(--font-inter)",
        ["--font-heading" as string]: isArabic
          ? "var(--font-noto-arabic)"
          : "var(--font-cormorant)",
      }}
    >
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <NextIntlClientProvider>
          <SessionProvider session={session}>
            <CurrencyProvider currency={currency}>
              <CartProvider>
                <WishlistProvider>
                  <ChatProvider>
                    <PageLoader />
                    <ScrollProgress />
                    <Header />
                    <main className="flex-1">{children}</main>
                    <WaveDivider />
                    <Footer />
                    <Toaster />
                    <ChatWidget />
                  </ChatProvider>
                </WishlistProvider>
              </CartProvider>
            </CurrencyProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
