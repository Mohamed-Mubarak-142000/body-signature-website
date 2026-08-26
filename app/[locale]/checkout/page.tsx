import { LogIn, ShoppingCart } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CheckoutForm } from "@/components/sections/CheckoutForm";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { auth } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop.checkout");
  return { title: t("title") };
}

type CartItem = { quantity: number; product: { price: string | number } };

export default async function CheckoutPage() {
  const t = await getTranslations("shop.checkout");
  const tCart = await getTranslations("shop.cart");
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

  const res = await backendFetch("/api/cart");
  const cart = res.ok ? await res.json() : { items: [] };
  const items: CartItem[] = cart.items ?? [];
  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-md px-6 py-16">
        <EmptyState
          icon={ShoppingCart}
          title={tCart("empty")}
          description={tCart("emptyDescription")}
          action={
            <Button size="lg" className="mt-2" nativeButton={false} render={<Link href="/shop" />}>
              {tCart("browseCta")}
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 pt-10 pb-20">
      <h1 className="mb-2 font-heading text-3xl text-foreground">{t("title")}</h1>
      <p className="mb-8 text-muted-foreground">{t("subtitle")}</p>
      <CheckoutForm total={total} />
    </section>
  );
}
