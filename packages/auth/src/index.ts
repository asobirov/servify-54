import type { BetterAuthOptions } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy } from "better-auth/plugins";

import { db } from "@acme/db/client";


export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;

  providers: {
    discord: {
      enabled?: boolean;
      clientId: string;
      clientSecret: string;
    };
    apple: {
      enabled?: boolean;
      clientId: string;
      clientSecret: string;
      appBundleIdentifier: string;
    };
    google: {
      enabled?: boolean;
      clientId: string;
      clientSecret: string;
    };
  }
}) {
  const { providers } = options;

  const config = {
    appName: "Servify",
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    plugins: [
      oAuthProxy({
        /**
         * Auto-inference blocked by https://github.com/better-auth/better-auth/pull/2891
         */
        currentURL: options.baseUrl,
        productionURL: options.productionUrl,
      }),
      expo(),
    ],
    socialProviders: {
      discord: {
        enabled: providers.discord.enabled,
        clientId: providers.discord.clientId,
        clientSecret: providers.discord.clientSecret,
        redirectURI: `${options.productionUrl}/api/auth/callback/discord`,
      },
      apple: {
        enabled: providers.apple.enabled,
  
        clientId: providers.apple.clientId,
        clientSecret: providers.apple.clientSecret,
        appBundleIdentifier: providers.apple.appBundleIdentifier,
        scope: ["email", "name"],
      },
      google: {
        enabled: providers.google.enabled,
  
        prompt: "select_account",
        clientId: providers.google.clientId,
        clientSecret: providers.google.clientSecret,
        redirectURI: `${options.productionUrl}/api/auth/callback/google`,
      },
    },

    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
      },
    },

    trustedOrigins: [options.productionUrl, "servify://", "https://appleid.apple.com"],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
