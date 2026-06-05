import { Form, useLocation } from "@remix-run/react";

import { LOCALE_LABELS, SUPPORTED_LOCALES } from "~/i18n/config";
import { useT } from "~/i18n/context";

/**
 * EN | DE segmented control. Posts the chosen locale to `/set-locale`, which
 * sets the `lang` cookie and redirects back to the current page (full reload),
 * so detection stays server-side in the root loader.
 */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, t } = useT();
  const location = useLocation();
  const redirectTo = `${location.pathname}${location.search}${location.hash}`;

  return (
    <Form
      method="post"
      action="/set-locale"
      aria-label={t.nav.toggleLabel}
      className={`inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5 ${className}`}
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {SUPPORTED_LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="submit"
            name="locale"
            value={code}
            aria-current={active ? "true" : undefined}
            aria-label={LOCALE_LABELS[code]}
            className={`rounded-md px-2 py-1 font-mono text-xs font-semibold transition-colors ${
              active
                ? "bg-accent text-white shadow-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </Form>
  );
}
