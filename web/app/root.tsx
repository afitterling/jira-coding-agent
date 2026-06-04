import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Jira Coding Agent — Dashboard</title>
        <Meta />
        <Links />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
          background: "#0f172a",
          color: "#e2e8f0",
        }}
      >
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
