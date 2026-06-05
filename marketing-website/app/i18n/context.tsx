/**
 * Client + SSR locale context.
 *
 * The active locale is decided once, server-side, by the root loader
 * (see `app/i18n.server.ts`) and threaded down through this provider so every
 * component can pull its copy with {@link useT} without prop drilling.
 */

import { createContext, useContext, useMemo } from "react";

import { DEFAULT_LOCALE, type Locale } from "~/i18n/config";
import { dictionaries, type Content } from "~/i18n/index";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** The active locale (`"en"` | `"de"`). */
export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/**
 * Returns the active locale plus its full content dictionary.
 *
 * Components read their own slice, e.g. `const { t } = useT(); t.hero.badge`.
 */
export function useT(): { locale: Locale; t: Content } {
  const locale = useLocale();
  return useMemo(() => ({ locale, t: dictionaries[locale] }), [locale]);
}
