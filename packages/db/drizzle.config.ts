import type { Config } from "drizzle-kit";

import { env } from "./src/env";

const nonPoolingUrl = env.POSTGRES_URL.replace(":6543", ":5432");

export default {
  schema: "./src/schema.ts",
  dialect: "postgresql",
  extensionsFilters: ["postgis"],
  dbCredentials: { url: nonPoolingUrl },
  casing: "snake_case",
} satisfies Config;
