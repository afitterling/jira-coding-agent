import { createElement, useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  /** Delay in ms before the reveal transition starts. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "span";
};

/**
 * Fades + slides its children into view the first time they enter the
 * viewport. SSR-safe: renders the content immediately and only layers the
 * animation on the client, so there's no flash of empty content and no
 * impact on crawlers / Lighthouse content checks.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return createElement(
    Tag,
    {
      ref,
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
      className: `reveal ${visible ? "is-visible" : ""} ${className}`,
    },
    children,
  );
}
