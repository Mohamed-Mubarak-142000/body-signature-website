"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { RevealImage } from "@/components/effects/RevealImage";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

export function AuthShell({
  namespace,
  image,
  imageAlt,
  children,
}: {
  namespace: "auth.login" | "auth.register";
  image: string;
  imageAlt: string;
  children: ReactNode;
}) {
  const t = useTranslations(namespace);
  const tAuth = useTranslations("auth");

  return (
    <section className="grid md:min-h-[calc(100vh-6rem)] md:grid-cols-2">
      <div className="relative hidden md:block">
        <RevealImage src={image} alt={imageAlt} priority className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute inset-x-10 bottom-10 text-white">
          <p className="font-heading text-2xl">Body Signature</p>
          <p className="mt-2 max-w-sm text-sm text-white/85">{tAuth("panelTagline")}</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16 md:px-12 lg:px-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="w-full max-w-sm"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600"
          >
            {t("eyebrow")}
          </motion.p>
          <motion.h1 variants={fadeUp} className="mt-3 font-heading text-3xl text-foreground md:text-4xl">
            {t("title")}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-3 text-sm text-muted-foreground">
            {t("subtitle")}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8">
            {children}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
