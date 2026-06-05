/**
 * Server-only locale detection for the Remix root loader.
 *
 * Precedence, highest first:
 *   1. the `lang` cookie (an explicit choice made via the language toggle)
 *   2. the browser's `Accept-Language` header (the "browser default language")
 *   3. {@link DEFAULT_LOCALE}
 */

import { createCookie } from "@remix-run/node";

import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES, type Locale } from "~/i18n/config";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Persists the toggle choice. Read in {@link getLocale}, written by the set-locale action. */
export const localeCookie = createCookie("lang", {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: ONE_YEAR,
});

/**
 * Pick the best supported locale from an `Accept-Language` header.
 *
 * Honours quality values, e.g. `de-DE,de;q=0.9,en;q=0.8` → `de`. Matching is on
 * the primary subtag (`de-AT` → `de`) so regional variants resolve correctly.
 */
export function parseAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      const quality = q ? Number.parseFloat(q.slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    const match = SUPPORTED_LOCALES.find((locale) => locale === base);
    if (match) return match;
  }

  return null;
}

export async function getLocale(request: Request): Promise<Locale> {
  const cookieValue = await localeCookie.parse(request.headers.get("Cookie"));
  if (isLocale(cookieValue)) return cookieValue;

  const fromHeader = parseAcceptLanguage(request.headers.get("Accept-Language"));
  if (fromHeader) return fromHeader;

  return DEFAULT_LOCALE;
}
