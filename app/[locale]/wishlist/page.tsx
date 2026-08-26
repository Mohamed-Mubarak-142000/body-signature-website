import { LogIn } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { WishlistClient } from "@/components/sections/WishlistClient";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { auth } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/shop-types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop.wishlist");
  return { title: t("title") };
}

type WishlistItem = { id: string; productId: string; product: Product };

export default async function WishlistPage() {
  const t = await getTranslations("shop.wishlist");
  const tAccount = await getTranslations("auth.account");
  const session = await auth();

  if (!session?.user) {
    return (
      <section className="mx-auto max-w-md px-6 py-16">
        <EmptyState
          icon={LogIn}
          title={tAccount("notSignedIn")}
          description={tAccount("notSignedInDescription")}
          action={
            <Button size="lg" className="mt-2" nativeButton={false} render={<Link href="/login" />}>
              {tAccount("signInCta")}
            </Button>
          }
        />
      </section>
    );
  }

  const res = await backendFetch("/api/wishlist");
  const wishlist = res.ok ? await res.json() : { items: [] };
  const items: WishlistItem[] = wishlist.items ?? [];

  return (
    <section className="mx-auto max-w-6xl px-6 pt-10 pb-20">
      <h1 className="mb-8 font-heading text-3xl text-foreground">{t("title")}</h1>
      <WishlistClient items={items} />
    </section>
  );
}
