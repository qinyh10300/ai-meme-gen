import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getD1Binding() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Configure the logical D1 binding before using server persistence."
    );
  }

  return env.DB;
}

export function getDb() {
  return drizzle(getD1Binding(), { schema });
}
