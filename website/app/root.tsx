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
  { title: "Code as spec. Driven by Jira. — Autonomous Claude coding agent" },
  {
    name: "description",
    content:
      "Turn a Jira story into shipped code. Label it #ready and an autonomous Claude Opus agent implements it, runs tests + QA, and opens a PR for human review.",
  },
  { name: "theme-color", content: "#06060c" },
  { property: "og:title", content: "Code as spec. Driven by Jira." },
  {
    property: "og:description",
    content:
      "An autonomous Claude Opus coding agent that ships your Jira backlog — implement, test, QA, PR.",
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
