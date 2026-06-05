import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { isLocale } from "~/i18n/config";
import { localeCookie } from "~/i18n.server";

/**
 * Persists a language choice from the toggle, then bounces back to the page
 * the user was on. A full reload follows, so the root loader re-detects the
 * locale (now cookie-first) and `<html lang>` + `<meta>` stay correct.
 */
export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const locale = form.get("locale");
  const redirectTo = sanitizeRedirect(form.get("redirectTo"));

  if (!isLocale(locale)) {
    return redirect(redirectTo);
  }

  return redirect(redirectTo, {
    headers: { "Set-Cookie": await localeCookie.serialize(locale) },
  });
}

// No UI — visiting directly just goes home.
export function loader() {
  return redirect("/");
}

/** Only allow same-origin, path-relative redirects (no open redirects). */
function sanitizeRedirect(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/";
  // Must be a single leading slash, not "//" (protocol-relative) or "/\".
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }
  return value;
}
