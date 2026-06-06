import type { MetaDescriptor } from "@remix-run/node";

import type { Locale } from "~/i18n/config";

/** Canonical production origin — used to build absolute canonical / og:url. */
export const SITE_URL = "https://agentic.sp33c.tech";
/** Brand suffix; every page title renders as `<Page> | sp33c`. */
export const BRAND = "sp33c";

export interface PageSeo {
  /** Page name shown before ` | sp33c` (e.g. "Agentic", "Pricing"). */
  title: string;
  description: string;
  /** Slug / URL path, e.g. "/" or "/pricing". Drives the canonical URL. */
  path: string;
  locale: Locale;
  /** Optional richer Open Graph title; falls back to the full page title. */
  ogTitle?: string;
  ogDescription?: string;
}

/**
 * Builds a complete SEO meta set for one page: branded title, description,
 * canonical link, and Open Graph / Twitter cards. Keeping this in one place
 * means every route advertises a consistent, crawlable slug.
 */
export function pageMeta({
  title,
  description,
  path,
  locale,
  ogTitle,
  ogDescription,
}: PageSeo): MetaDescriptor[] {
  const fullTitle = `${title} | ${BRAND}`;
  const url = SITE_URL + path;
  const shareTitle = ogTitle ?? fullTitle;
  const shareDescription = ogDescription ?? description;
  return [
    { title: fullTitle },
    { name: "description", content: description },
    { name: "author", content: "Alex Fitterling — sp33c" },
    { name: "theme-color", content: "#030307" },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:title", content: shareTitle },
    { property: "og:description", content: shareDescription },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: BRAND },
    { property: "og:locale", content: locale === "de" ? "de_DE" : "en_US" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: shareTitle },
    { name: "twitter:description", content: shareDescription },
  ];
}
