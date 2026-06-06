import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { destroySession } from "~/lib/auth.server";

async function clear() {
  return redirect("/getting-started?mode=login", {
    headers: { "Set-Cookie": await destroySession() },
  });
}

export async function loader(_: LoaderFunctionArgs) {
  return clear();
}

export async function action(_: ActionFunctionArgs) {
  return clear();
}
