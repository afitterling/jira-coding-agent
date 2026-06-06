import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";

import { I18nProvider } from "~/i18n/context";
import { DEFAULT_LOCALE } from "~/i18n/config";
import { dictionaries } from "~/i18n/index";
import { getLocale } from "~/i18n.server";
import { pageMeta } from "~/seo";
import tailwind from "~/tailwind.css?url";

export async function loader({ request }: LoaderFunctionArgs) {
  return json({ locale: await getLocale(request) });
}

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap",
  },
  { rel: "stylesheet", href: tailwind },
];

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const locale = data?.locale ?? DEFAULT_LOCALE;
  const m = dictionaries[locale].meta;
  return pageMeta({
    title: m.title,
    description: m.description,
    path: "/",
    locale,
    ogTitle: m.ogTitle,
    ogDescription: m.ogDescription,
  });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const locale = data?.locale ?? DEFAULT_LOCALE;
  return (
    <html lang={locale} className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-sans">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { locale } = useLoaderData<typeof loader>();
  return (
    <I18nProvider locale={locale}>
      <Outlet />
    </I18nProvider>
  );
}
