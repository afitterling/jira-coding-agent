import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

const WEB_APP_URL = process.env.WEB_APP_URL ?? "";

/**
 * The auth and onboarding flows live in the web app. Redirect the visitor
 * to the appropriate page there so nothing is duplicated on the marketing site.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") === "login" ? "login" : "signup";
  return redirect(`${WEB_APP_URL}/${mode}`);
}
