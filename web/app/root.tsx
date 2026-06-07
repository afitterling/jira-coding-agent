import type { LinksFunction } from "@remix-run/node";
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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>sp33c — Dashboard</title>
        <Meta />
        <Links />
      </head>
      <body className="relative min-h-screen font-sans">
        {/* Branded backdrop — deep ink base, accent glow, dotted grid */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#0a0a16_0%,#040409_45%,#000000_100%)]" />
          <div className="absolute inset-0 bg-grid opacity-[0.18] mask-fade-b" />
          <div className="absolute left-1/2 top-[-14%] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-accent/15 blur-[150px]" />
          <div className="absolute right-[8%] top-[28%] h-[280px] w-[280px] rounded-full bg-accent-violet/[0.08] blur-[130px]" />
        </div>
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
