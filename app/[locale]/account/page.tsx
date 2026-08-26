import { CalendarClock, LogIn, Package } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { auth } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";
import { SignOutButton } from "@/components/sections/SignOutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.account");
  return { title: t("title") };
}

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string | number;
};
type Booking = {
  id: string;
  status: string;
  requestedAt: string;
  service: { translations: { locale: string; title: string }[] };
};

async function getOrders(): Promise<Order[]> {
  const res = await backendFetch("/api/me/orders");
  if (!res.ok) return [];
  return res.json();
}

async function getBookings(): Promise<Booking[]> {
  const res = await backendFetch("/api/me/bookings");
  if (!res.ok) return [];
  return res.json();
}

export default async function AccountPage() {
  const t = await getTranslations("auth.account");
  const session = await auth();

  if (!session?.user) {
    return (
      <section className="mx-auto max-w-md px-6 py-16">
        <EmptyState
          icon={LogIn}
          title={t("notSignedIn")}
          description={t("notSignedInDescription")}
          action={
            <Button size="lg" className="mt-2" nativeButton={false} render={<Link href="/login" />}>
              {t("signInCta")}
            </Button>
          }
        />
      </section>
    );
  }

  const [orders, bookings] = await Promise.all([getOrders(), getBookings()]);

  return (
    <section className="mx-auto max-w-3xl space-y-8 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("signedInAs")} {session.user.name ?? session.user.email}
          </p>
        </div>
        <SignOutButton label={t("signOut")} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("ordersTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t("noOrders")}
              description={t("noOrdersDescription")}
              className="py-8"
            />
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 p-4 text-sm"
                >
                  <span>
                    {t("orderNumber")} {order.orderNumber}
                  </span>
                  <span className="text-muted-foreground">{order.status}</span>
                  <span>{order.totalAmount}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("bookingsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title={t("noBookings")}
              description={t("noBookingsDescription")}
              className="py-8"
            />
          ) : (
            <ul className="space-y-3">
              {bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 p-4 text-sm"
                >
                  <span>
                    {booking.service.translations.find((tr) => tr.locale === "en")?.title ?? "—"}
                  </span>
                  <span className="text-muted-foreground">{booking.status}</span>
                  <span>{new Date(booking.requestedAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
