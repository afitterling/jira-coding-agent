import { Form, useLocation, useSubmit } from "@remix-run/react";

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
  const submit = useSubmit();
  const redirectTo = `${location.pathname}${location.search}${location.hash}`;

  return (
    <Form
      method="post"
      action="/set-locale"
      className={`inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2 py-1 ${className}`}
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <span className="mr-1 text-accent" aria-hidden>
        <GlobeIcon className="h-4 w-4" />
      </span>
      <div className="relative">
        <select
          name="locale"
          defaultValue={locale}
          aria-label={t.nav.toggleLabel}
          onChange={(event) => submit(event.currentTarget.form)}
          className="appearance-none bg-transparent pr-5 font-mono text-xs font-semibold text-slate-200 outline-none"
        >
          {SUPPORTED_LOCALES.map((code) => (
            <option key={code} value={code} className="bg-ink-950 text-slate-100">
              {LOCALE_LABELS[code]}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-0 grid place-items-center text-slate-500">
          <ChevronIcon className="h-3 w-3" />
        </span>
      </div>
      <noscript>
        <button
          type="submit"
          className="ml-2 rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-200"
        >
          OK
        </button>
      </noscript>
    </Form>
  );
}

function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3 12h18M12 3c2.52 2.4 3.95 5.69 4 9-.05 3.31-1.48 6.6-4 9m0-18c-2.52 2.4-3.95 5.69-4 9 .05 3.31 1.48 6.6 4 9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden>
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
