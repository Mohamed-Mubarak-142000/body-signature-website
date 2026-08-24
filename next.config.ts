import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Pin this app's own directory as the Turbopack root — this repo has
  // three lockfiles (one per app under backend/, dashboard/, frontend/),
  // which otherwise confuses Turbopack's root auto-detection. See
  // ../backend/next.config.ts for the fuller explanation.
  turbopack: {
    root: __dirname,
  },
};

export default withNextIntl(nextConfig);
