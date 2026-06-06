import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { destroySession } from "~/lib/auth.server";

const WEB_APP_URL = process.env.WEB_APP_URL ?? "";

async function clear() {
  return redirect(`${WEB_APP_URL}/login`, {
    headers: { "Set-Cookie": await destroySession() },
  });
}

export async function loader(_: LoaderFunctionArgs) {
  return clear();
}

export async function action(_: ActionFunctionArgs) {
  return clear();
}
