import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

import { initAuth } from "@acme/auth";

import { env } from "~/env";

const baseUrl =
  env.VERCEL_ENV === "production"
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : env.VERCEL_ENV === "preview"
      ? `https://${env.VERCEL_URL}`
      : "http://localhost:3000";

export const auth = initAuth({
  baseUrl,
  productionUrl: `https://${env.VERCEL_PROJECT_PRODUCTION_URL ?? "turbo.t3.gg"}`,
  secret: env.AUTH_SECRET,

  providers: {
    discord: {
      enabled: true,
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET,
    },
    apple: {
      enabled: false,
      clientId: env.AUTH_APPLE_CLIENT_ID,
      clientSecret: env.AUTH_APPLE_CLIENT_SECRET,
      appBundleIdentifier: env.AUTH_APPLE_APP_BUNDLE_IDENTIFIER,
    },
    google: {
      enabled: false,
      clientId: env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.AUTH_GOOGLE_CLIENT_SECRET,
    },
  },
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
