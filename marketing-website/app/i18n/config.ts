/**
 * Shared, dependency-free locale configuration.
 *
 * Kept separate from `i18n.server.ts` so it can be imported from both the
 * server (cookie + Accept-Language parsing) and the browser bundle (context,
 * toggle) without dragging server-only Remix APIs into the client.
 */

export const SUPPORTED_LOCALES = ["en", "de"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Display labels for the language toggle. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}
