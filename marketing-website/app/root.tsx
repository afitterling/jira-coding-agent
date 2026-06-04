import type {
  LinksFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import tailwind from "~/tailwind.css?url";

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

export const meta: MetaFunction = () => [
  { title: "Agentic Coding with Jira — sp33c" },
  {
    name: "description",
    content:
      "sp33c builds agentic coding with Jira: label a story #ready and an autonomous Claude Opus agent implements it, runs tests + QA, and opens a PR. Human Override keeps you in command.",
  },
  { name: "author", content: "Alex Fitterling — sp33c" },
  { name: "theme-color", content: "#030307" },
  { property: "og:title", content: "Agentic Coding with Jira — sp33c" },
  {
    property: "og:description",
    content:
      "Agentic coding with Jira by sp33c — implement, test, QA, PR. Autonomy you can veto.",
  },
  { property: "og:type", content: "website" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
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
  return <Outlet />;
}
