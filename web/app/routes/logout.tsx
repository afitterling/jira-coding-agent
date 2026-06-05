import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { destroySession } from "~/lib/auth.server";

async function clear() {
  return redirect("/login", { headers: { "Set-Cookie": await destroySession() } });
}

export async function action(_: ActionFunctionArgs) {
  return clear();
}

// Allow GET /logout too, for a plain link.
export async function loader(_: LoaderFunctionArgs) {
  return clear();
}
